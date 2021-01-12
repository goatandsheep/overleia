const ffmpegMpeg = require('ffmpeg.js/ffmpeg-mp4');
const ffmpegWebm = require('ffmpeg.js/ffmpeg-webm');

/**
 * @param {String} basePath of base video input
 * @param {String} pipPath of PIP video input
 * @param {'mp4' | 'webm'} type of input
 * @param {'TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT'} gravity
 */
const PipLib = function(basePath, pipPath, type="mp4", gravity='BOTTOM_RIGHT') {
    let ffmpeg
    if (type === 'webm') {
        ffmpeg = ffmpegWebm
    } else {
        ffmpeg = ffmpegMpeg
    }
    try {
        ffmpeg({
            arguments: [
                "-i",
                basePath,
                "-vf",
                `movie=${pipPath},scale=250: -1 [inner]; [in][inner] overlay =10: 10 [out]" completed.mp4`
            ]
        })
    } catch (err) {
        throw err
    }
}

module.exports = PipLib
