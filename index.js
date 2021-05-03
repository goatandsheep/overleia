'use strict';

require('@ffmpeg/core');
const {
	createFFmpeg
	// FetchFile
} = require('@ffmpeg/ffmpeg');
// Const fs = require('fs');

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
 * @typedef {object} OverleiaInput
 * @property {Buffer[]} inputs - file paths
 * @property {TemplateInput} template
 * @property {String} [filetype="mp4"]
 * @property {Boolean} verbose
 */

/**
 * @param {OverleiaInput} params
 * @returns {Promise<Uint8Array>}
 */
const PipLib = async function (parameters) {
	try {
		const data = [];
		const inputArgs = [];
		const inputsNumber = parameters.inputs.length;
		// Const outputFile = (parameters.outputFile || 'completed') + '.' + (parameters.filetype || 'mp4');

		if (!parameters.template.height) {
			throw new Error('No scene height set');
		}

		if (inputsNumber < parameters.inputs.views) {
			throw new Error('Not enough input files');
		}

		const sceneWidth = parameters.template.width || (parameters.template.height * 16 / 9);
		// Let inputMediaString = `pad=${sceneWidth}:${params.template.height}:0:0[base];`
		// let inputMediaString = `nullsrc=size=${sceneWidth}x${params.template.height}[base];`
		let inputMediaString = '';
		const mergeStrings = [];
		let audioString = '';
		for (let i = 0, length = inputsNumber; i < length; i++) {
            const tempFileName = 'input' + i + '.' + (parameters.filetype || 'mp4')
			data.push({
				name: tempFileName,
				data: new Uint8Array(parameters.inputs[i])
			});
			// Const arr = new Uint8Array(fs.readFileSync(directory + params.inputs[i]))
			// data.push({
			//     name: params.inputs[i],
			//     data: arr
			// })
			inputArgs.push('-i');
			inputArgs.push(tempFileName);
			const layerWidth = parameters.template.views[i].width || -1;
			const layerDelay = parameters.template.views[i].delay || 0;
			// InputMediaString = inputMediaString.concat(`[${i}:v]setpts=PTS-STARTPTS+${layerDelay}/TB,scale=${layerWidth}:${params.template.views[i].height}[layer_${i}];`)
			inputMediaString = inputMediaString.concat(`[${i}:v]setpts=PTS-STARTPTS+${layerDelay}/TB,scale=${layerWidth}:${parameters.template.views[i].height}`);
			// InputMediaString = inputMediaString.concat(`[${i}:v]scale=${layerWidth}:${params.template.views[i].height}[layer_${i}];`)
			inputMediaString = i === 0 ? inputMediaString.concat(`,pad=${sceneWidth}:${parameters.template.height}:(ow-iw)/2:(oh-ih)/2[layer_${i}];`) : inputMediaString.concat(`[layer_${i}];`);

			mergeStrings.push(`[layer_${i}]overlay=${parameters.template.views[i].y}:${parameters.template.views[i].x}:eof_action=pass`);
			audioString = audioString.concat(`[aux_${i}]`);
			inputMediaString = inputMediaString.concat(`[${i}:a]adelay=delays=${layerDelay}s:all=1[aux_${i}];`);
		}

		// For (let i = 0, len = mergeStrings.length; i < len; i++) {
		for (let i = 1, length = mergeStrings.length; i < length; i++) {
			let prefix = '';
			let suffix = `[tmp${i + 1}];`;
			if (i === 0) {
				// Prefix = '[base]'
				prefix = '';
			} else if (i === 1) {
				// Remove if pad re-added
				prefix = '[layer_0]';
				// Prefix='[tmp1]'
			} else {
				prefix = `[tmp${i}]`;
			}

			if (i === (length - 1)) {
				suffix = '[vout];';
			}

			inputMediaString = inputMediaString.concat(prefix + mergeStrings[i] + suffix);
		}

		inputMediaString = inputMediaString.concat(`${audioString}amix=inputs=${inputsNumber}[aout]`);

		inputArgs.push('-filter_complex');

		inputArgs.push(inputMediaString);

		inputArgs.push('-map');
		inputArgs.push('[vout]');
		inputArgs.push('-map');
		inputArgs.push('[aout]');

		if (parameters.filetype !== 'webm') {
			inputArgs.push('-preset');
			inputArgs.push('ultrafast');
		}

		inputArgs.push('-y');
		inputArgs.push('completed.mp4');

		if (parameters.verbose) {
			console.log('inputArgs', inputArgs);
		}

		console.log('entry', data);
		return ffmpegProcessWasm(data, inputArgs, true);
		// Const out = await ffmpegProcessWasm(data, inputArgs, true)
		// const res = await fs.promises.writeFile(directory + outputFile, out)
		// if (!res) {
		//     throw new Error('proc failed')
		// }
		// return res
	} catch (error) {
		throw error;
	}
};

const ffmpegProcessWasm = async function (data, inputArgs, verbose = false) {
	try {
		// TODO: logger: () => {}
		// TODO: progress: () => {}
		const ffmpeg = createFFmpeg({log: verbose});

		await ffmpeg.load();
		data.forEach(entry => {
			ffmpeg.FS('writeFile', entry.name, entry.data);
		});
		await ffmpeg.run(...inputArgs);
		const out = ffmpeg.FS('readFile', 'completed.mp4');
		return out;
	} catch (error) {
		throw error;
	}
};

module.exports = PipLib;
