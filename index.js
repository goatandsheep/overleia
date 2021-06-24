'use strict';
const fs = require('fs').promises;
const spawn = require('child_process').spawn;

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

/**
 * @typedef {object} ViewInput
 * @property {Number} x
 * @property {Number} y
 * @property {Number} height
 * @property {Number} [width] optional to maintain ratio
 * @property {Number} [delay=0]
 */

/**
 * @typedef {object} TemplateInput
 * @property {Number} height
 * @property {Number} [width] optional to maintain ratio
 * @property {ViewInput[]} views
 */

/**
 * @callback ProgressCB
 * @param {Number} percent
 * @return {void}
 */

/**
 * @typedef {object} OverleiaInput
 * @property {String[]} inputs - file paths
 * @property {String} [output="completed.mp4"] - file path
 * @property {TemplateInput} template
 * @property {String} [filetype="mp4"]
 * @property {Boolean} verbose
 * @property [ProgressCB] progressCallback
 */

/**
 * This is a path-specific library so outputs are more an indication of success
 * @param {OverleiaInput} params
 * @returns {Promise<Boolean>}
 */
const PipLib = async function (parameters) {
	try {
		const data = [];
		const inputArgs = [];
		const inputsNumber = parameters.inputs.length;
		let audioInputsNumber = 0;
		// Const outputFile = (parameters.outputFile || 'completed') + '.' + (parameters.filetype || 'mp4');

		const outputPath = parameters.output || 'completed.mp4';
		if (!parameters.template.height) {
			throw new Error('No scene height set');
		}

		if (inputsNumber < parameters.template.views) {
			throw new Error('Not enough input files');
		}

		const sceneWidth = parameters.template.width || Math.ceil(parameters.template.height * 16 / 9);
		// Let inputMediaString = `pad=${sceneWidth}:${params.template.height}:0:0[base];`
		// let inputMediaString = `nullsrc=size=${sceneWidth}x${params.template.height}[base];`

		// To get duration of video, using ffprobe, this will output video information in json format:
		// ffprobe -v quiet -print_format json -show_format
		const metadata = await ffprobeBin(parameters.inputs, parameters.verbose);
		// Get it in json_result['format']['duration']
		// To get duration of video using only ffmpeg, call ffmpeg with an input file without any other option, like:
		// ffmpeg -i filename.mp4
		// and then search for the string "Duration:" in the output. You need to convert from Timecode to Seconds.
 		/**
		  * Duration of the longest input video
		  * @type {Number} seconds
		  */
		const maxDuration = await totalDurationCalculate(parameters.template.views, metadata);
		if (parameters.verbose) {
			console.log('maxDur', maxDuration);
		}

		let inputMediaString = `color=s=${sceneWidth}x${parameters.template.height}:c=black:d=${maxDuration}[base];`;
		// Const mergeStrings = [];
		let audioString = '';
		for (let i = 0, length = inputsNumber; i < length; i++) {
			const layerWidth = parameters.template.views[i].width && (parameters.template.views[i].width - (parameters.template.views[i].width % 2)) || -1;
			const layerHeight = parameters.template.views[i].height - (parameters.template.views[i].height % 2);
			const layerDelay = parameters.template.views[i].delay || 0;

			if (metadata[i].duration < 0.1) {
				inputArgs.push('-t');
				inputArgs.push(maxDuration - layerDelay);
				inputArgs.push('-loop');
				inputArgs.push('1');
			}

			inputArgs.push('-i');
			inputArgs.push(parameters.inputs[i]);

			inputMediaString = inputMediaString.concat(`[${i}:v]setpts=PTS-STARTPTS+${layerDelay}/TB,scale=${layerWidth}:${layerHeight}:force_original_aspect_ratio=1[layer_${i}];`);
			inputMediaString = inputMediaString.concat(`[base][layer_${i}]overlay=${parameters.template.views[i].x}:${parameters.template.views[i].y}:eof_action=pass[base];`);

			// MergeStrings.push(`[base][layer_${i}]overlay=${parameters.template.views[i].y}:${parameters.template.views[i].x}:eof_action=pass`);
			if (metadata[i].streams.includes('audio')) {
				audioInputsNumber++;
				audioString = audioString.concat(`[aux_${i}]`);
				inputMediaString = inputMediaString.concat(`[${i}:a]adelay=${layerDelay * 1000}|${layerDelay * 1000}|${layerDelay * 1000}|${layerDelay * 1000}|${layerDelay * 1000}|${layerDelay * 1000}[aux_${i}];`);
			}
		}

		inputMediaString = inputMediaString.concat(`${audioString}amix=inputs=${audioInputsNumber}[aout]`);

		inputArgs.push('-filter_complex');

		inputArgs.push(inputMediaString);

		inputArgs.push('-map');
		inputArgs.push('[base]');
		inputArgs.push('-map');
		inputArgs.push('[aout]');

		if (parameters.filetype !== 'webm') {
			inputArgs.push('-preset');
			inputArgs.push('ultrafast');
		}

		inputArgs.push('-y');
		inputArgs.push(outputPath);

		if (parameters.verbose) {
			console.log('inputArgs', inputArgs);
			console.log('entry', parameters.inputs);
		}

		return await ffmpegProcessBin(parameters.inputs, inputArgs, parameters.verbose, maxDuration, parameters.progressCallback);
	} catch (error) {
		throw error;
	}
};

/**
 *
 * @param {ViewInput[]} inputs
 * @param {any[]} metadata
 * @returns {Number} seconds
 */
const totalDurationCalculate = async function (inputs, metadata) {
	if (inputs.length !== metadata.length) {
		throw new Error('mismatched template and input lengths');
	}

	const lengthProms = inputs.map((entry, i) => {
		return (entry.delay || 0) + metadata[i].duration;
	});
	const lengths = await Promise.all(lengthProms);
	return Math.max(...lengths, 1);
};

const ffprobeBin = async function (data, verbose) {
	const metaProms = data.map(entry => {
		return new Promise((resolve, reject) => {
			try {
				ffmpeg.ffprobe(entry, (error, metadata) => {
					if (error) {
						console.error('error');
						reject(error);
					}

					const streams = metadata.streams.map(stream => {
						return stream.codec_type;
					});
					if (verbose) {
						console.log('meta', metadata);
					}

					const filteredObject = metadata.format;
					filteredObject.streams = streams;
					// Resolve(metadata.format)
					resolve(filteredObject);
				});
			} catch (error) {
				reject(error);
			}
		});
	});
	return Promise.all(metaProms);
};

const ffmpegProcessBin = async function (data, inputArgs, verbose = false, maxDuration, progressCallback) {
	try {
		const ffProm = new Promise((resolve, reject) => {
			const ffmpeg = spawn(ffmpegPath, inputArgs);
			ffmpeg.stderr.on('data', data => {
				const progress = {};

				// Remove all spaces after = and trim
				const line = data.toString();
				if (line.match(/^frame=/g)) {
					const progressParts = line.replace(/(\s){2,}/g, ' ').replace(/=\s/g, '=').split(/(\s)+/g);

					// Split every progress part by "=" to get key and value
					for (const progressPart of progressParts) {
					  const progressSplit = progressPart.replace(' ', '').split('=');
					  if (progressSplit.length === 2) {
							const key = progressSplit[0];
							const value = progressSplit[1];

							progress[key] = value;
					  }
					}

					const timeParts = progress.time.split(':');
					const seconds = (timeParts[0] * 3600) + (timeParts[1] * 60) + parseInt(timeParts[2]);
					const timey = seconds / maxDuration;
					const percent = Math.floor(timey * 100);
					if (progressCallback) {
						progressCallback(percent);
					}

					if (verbose) {
						console.log('percent', `${percent}%`);
					}
				}
			});
			ffmpeg.on('exit', args => {
				if (verbose) {
					console.log('ff success exit');
				}

				resolve(args || true);
			});
			ffmpeg.on('close', args => {
				if (verbose) {
					console.log('ff success close');
				}

				resolve(args || true);
			});
			ffmpeg.on('error', error => {
				console.error('ff error', error);
				reject(error);
			});
		});
		return await ffProm;
	} catch (error) {
		throw error;
	}
};

module.exports = PipLib;
