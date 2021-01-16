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

/**
 * @param {String} directory of base video input
 * @param {String} baseFile of base video input
 * @param {String} pipFile of PIP video input
 * @param {'mp4' | 'webm'} type of input
 * @param {'TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT'} gravity
 */
const PipLib = function(directory, baseFile, pipFile, type="mp4", gravity='TOP_LEFT') {
    let ffmpeg
    if (type === 'webm') {
        ffmpeg = ffmpegWebm
    } else {
        ffmpeg = ffmpegMpeg
    }
    let xPos = 0
    let yPos = 0
    let padHeight = 10
    let padWidth = 10
    let baseHeight = 0
    let baseWidth = 0
    let overlayHeight = 0
    let overlayWidth = 0
    switch(gravity) {
        case 'TOP_RIGHT':
            xPos = `main_w-overlay_w-${padWidth}`
            yPos = padHeight
            break;
        case 'BOTTOM_LEFT':
            xPos = padWidth
            yPos = `main_h-overlay_h-${padHeight}`
            break;
        case 'BOTTOM_RIGHT':
            xPos = `main_w-overlay_w-${padWidth}`
            yPos = `main_h-overlay_h-${padHeight}`
            break;
        case 'TOP_LEFT':
        default:
            xPos = padWidth
            yPos = padHeight

    }
    try {
        let stdout = ''
        let stderr = ''
        const baseData = new Uint8Array(fs.readFileSync(__dirname + directory + baseFile));
        const pipData = new Uint8Array(fs.readFileSync(__dirname + directory + pipFile));
        const idealheap = 1024 * 1024 * 1024;
        const result = ffmpeg({
            MEMFS: [
                { name: baseFile, data: baseData },
                { name: pipFile, data: pipData }
            ],
            arguments: [
                "-i",
                baseFile,
                "-i",
                pipFile,
                "-filter_complex",
                `[1:v]scale=250:-1[scaled_overlay],[0:v][scaled_overlay]overlay=${xPos}:${yPos}`,
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
