const ffmpegMpeg = require('ffmpeg.js/ffmpeg-mp4');
const ffmpegWebm = require('ffmpeg.js/ffmpeg-webm');
const fs = require('fs');

/**
 * @param {String} basePath of base video input
 * @param {String} pipPath of PIP video input
 * @param {'mp4' | 'webm'} type of input
 * @param {'TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT'} gravity
 */
const PipLib = function(basePath, pipPath, type="mp4", gravity='TOP_LEFT') {
    let ffmpeg
    if (type === 'webm') {
        ffmpeg = ffmpegWebm
    } else {
        ffmpeg = ffmpegMpeg
    }
    let xPos
    let yPos
    let padHeight = 10
    let padWidth = 10
    let baseHeight
    let baseWidth
    let overlayHeight
    let overlayWidth
    switch(gravity) {
        case 'TOP_RIGHT':
            xPos = baseWidth - overlayWidth - padWidth
            yPos = padHeight
            break;
        case 'BOTTOM_LEFT':
            xPos = padWidth
            break;
        case 'BOTTOM_RIGHT':
            xPos = baseWidth - overlayWidth - padWidth
            yPos = baseHeight - overlayHeight - padHeight
            break;
        case 'TOP_LEFT':
        default:
            xPos = padWidth
            yPos = padHeight

    }
    try {
        let stdout = ''
        let stderr = ''
        ffmpeg({
            mounts: [{type: "NODEFS", opts: {root: "."}, mountpoint: "/data"}],
            arguments: [
                "-i",
                basePath,
                "-vf",
                `"movie=${pipPath},scale=250: -1 [inner]; [in][inner] overlay =${xPos}: ${yPos} [out]"`,
                "/data/completed.mp4"
            ],
            print: (data) => { stdout += data + "\n"; },
            printErr: (data) => { stderr += data + "\n"; },
            onExit: (code) => {
                console.log("Process exited with code " + code);
                console.log(stdout);
                if (stderr) {
                    throw stderr;
                }
            },
        })
    } catch (err) {
        throw err
    }
}

module.exports = PipLib
