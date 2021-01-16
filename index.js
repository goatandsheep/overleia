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
        let inputArgs = []

        // let inputMediaString = `[1:v]scale=-1:${pipHeight}[scaled_overlay],[0:v][scaled_overlay]overlay=${yPos}:${xPos}`
        if (!params.template.height) {
            throw new Error("No scene height set")
        }
        let sceneWidth = params.template.width || (params.template.height * 16 / 9)
        console.log('sceneWidth', sceneWidth)
        // let inputMediaString = `pad=${params.template.height}:${sceneWidth}:0:0:black[base];`
        let inputMediaString = ""
        let mergeStrings = []
        for (let i = 0, len = params.inputs.length; i < len; i++) {
            const arr = new Uint8Array(fs.readFileSync(__dirname + directory + params.inputs[i]))
            data.push({
                name: params.inputs[i],
                data: arr
            })
            inputArgs.push('-i')
            inputArgs.push(params.inputs[i])
            let layerWidth = params.template.views[i].width || -1
            console.log('layerWidth', layerWidth)
            // inputMediaString = inputMediaString.concat(`[${i}:v]setpts=PTS-STARTPTS,scale=${layerWidth}:${params.template.views[i].height}[layer_${i}];`)
            inputMediaString = inputMediaString.concat(`[${i}:v]scale=${layerWidth}:${params.template.views[i].height}[layer_${i}];`)
            mergeStrings.push(`[layer_${i}]overlay=${params.template.views[i].y}:${params.template.views[i].x}`)
        }
        // for (let i = 0, len = mergeStrings.length; i < len; i++) {
        for (let i = 1, len = mergeStrings.length; i < len; i++) {
            let prefix = ''
            let suffix = `[tmp${i + 1}]`
            if (i === 0) {
                // prefix = '[base]'
                prefix = ''
            } else if (i === 1) {
                // remove if pad re-added
                prefix = '[layer_0]'
            } else {
                prefix = `[tmp${i}]`
            }
            if (i === (len - 1)) {
                suffix = ''
            }
            inputMediaString = inputMediaString.concat(prefix + mergeStrings[i] + suffix + ';')
        }
        inputMediaString = inputMediaString.slice(0,-1)
        // inputMediaString = '"' + inputMediaString + '"'
        console.log('inputMediaString', inputMediaString)

        inputArgs.push("-filter_complex")
        inputArgs.push(inputMediaString)
        if (params.filetype !== 'webm') {
            inputArgs.push('-preset')
            inputArgs.push('ultrafast')
        }
        inputArgs.push('-y')
        inputArgs.push('completed.mp4')

        console.log('inputArgs', inputArgs)

        const idealheap = 1024 * 1024 * 1024;
        const result = ffmpeg({
            MEMFS: data,
            arguments: inputArgs,
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
