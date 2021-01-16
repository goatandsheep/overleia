const ffmpegMpeg = require('ffmpeg.js/ffmpeg-mp4');
const ffmpegWebm = require('ffmpeg.js/ffmpeg-webm');
// const ffmpeg = require('ffmpeg.js');
const fs = require('fs');

/**
 * @typedef {object} ViewInput
 * @property {Number} x
 * @property {Number} y
 * @property {Number} height
 * @property {Number} [width] optional to maintain ratio
 */

/**
 * @typedef {object} TemplateInput
 * @property {Number} height
 * @property {Number} [width] optional to maintain ratio
 * @property {ViewInput[]} views
 */

/**
 * @typedef {object} OverleiaInput
 * @property {String[]} inputs - file paths
 * @property {TemplateInput} template
 * @property {String} [filetype="mp4"]
 */

/**
 * @param {OverleiaInput} params
 * @param {String} directory - maximum 1 slash
 */
const PipLib = function(params, directory) {
    let ffmpeg
    if (params.filetype === 'webm') {
        ffmpeg = ffmpegWebm
    } else {
        ffmpeg = ffmpegMpeg
    }

    let xPos = params.template.views[1].x
    let yPos = params.template.views[1].y
    let pipHeight = params.template.views[1].height

    try {
        let stdout = ''
        let stderr = ''
        let data = []
        data.push(new Uint8Array(fs.readFileSync(__dirname + directory + params.inputs[0])));
        data.push(new Uint8Array(fs.readFileSync(__dirname + directory + params.inputs[1])));
        const idealheap = 1024 * 1024 * 1024;
        const result = ffmpeg({
            MEMFS: [
                { name: params.inputs[0], data: data[0] },
                { name: params.inputs[1], data: data[1] }
            ],
            arguments: [
                "-i",
                params.inputs[0],
                "-i",
                params.inputs[1],
                "-filter_complex",
                `[1:v]scale=${pipHeight}:-1[scaled_overlay],[0:v][scaled_overlay]overlay=${xPos}:${yPos}`,
                "-preset",
                "ultrafast",
                "-y",
                "completed.mp4"
            ],
            print: (data) => { stdout += data + "\n"; },
            printErr: (data) => { stderr += data + "\n"; },
            onExit: (code) => {
                console.log("Process exited with code " + code);
                console.log(stdout);
                console.error(stderr)
            },
            TOTAL_MEMORY: idealheap,
        })
        const out = result.MEMFS[0];
        fs.writeFileSync(__dirname + directory + out.name, out.data)
    } catch (err) {
        throw err
    }
}

module.exports = PipLib
