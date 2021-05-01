const { createFFmpeg, fetchFile} = require('@ffmpeg/ffmpeg')
const fs = require('fs');

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
 * @property {String[]} inputs - file paths
 * @property {TemplateInput} template
 * @property {String} [filetype="mp4"]
 * @property {Boolean} verbose
 */

/**
 * @param {OverleiaInput} params
 * @param {String} directory - maximum 1 slash
 */
const PipLib = async function(params, directory) {

    try {
        let data = []
        let inputArgs = []
        let inputsNum = params.inputs.length
        const outputFile = (params.outputFile || 'completed') + (params.filetype || 'mp4')

        if (!params.template.height) {
            throw new Error("No scene height set")
        }
        if (inputsNum < params.inputs.views) {
            throw new Error("Not enough input files")
        }
        let sceneWidth = params.template.width || (params.template.height * 16 / 9)
        // let inputMediaString = `pad=${sceneWidth}:${params.template.height}:0:0[base];`
        // let inputMediaString = `nullsrc=size=${sceneWidth}x${params.template.height}[base];`
        let inputMediaString = ""
        let mergeStrings = []
        let audioString = ''
        for (let i = 0, len = inputsNum; i < len; i++) {
            const arr = new Uint8Array(fs.readFileSync(directory + params.inputs[i]))
            data.push({
                name: params.inputs[i],
                data: arr
            })
            inputArgs.push('-i')
            inputArgs.push(params.inputs[i])
            let layerWidth = params.template.views[i].width || -1
            let layerDelay = params.template.views[i].delay || 0
            // inputMediaString = inputMediaString.concat(`[${i}:v]setpts=PTS-STARTPTS+${layerDelay}/TB,scale=${layerWidth}:${params.template.views[i].height}[layer_${i}];`)
            inputMediaString = inputMediaString.concat(`[${i}:v]setpts=PTS-STARTPTS+${layerDelay}/TB,scale=${layerWidth}:${params.template.views[i].height}`)
            // inputMediaString = inputMediaString.concat(`[${i}:v]scale=${layerWidth}:${params.template.views[i].height}[layer_${i}];`)
            if (i === 0) {
                inputMediaString = inputMediaString.concat(`,pad=${sceneWidth}:${params.template.height}:(ow-iw)/2:(oh-ih)/2[layer_${i}];`)
            } else {
                inputMediaString = inputMediaString.concat(`[layer_${i}];`)
            }
            mergeStrings.push(`[layer_${i}]overlay=${params.template.views[i].y}:${params.template.views[i].x}:eof_action=pass`)
            audioString = audioString.concat(`[aux_${i}]`)
            inputMediaString = inputMediaString.concat(`[${i}:a]adelay=delays=${layerDelay}s:all=1[aux_${i}];`)
        }
        // for (let i = 0, len = mergeStrings.length; i < len; i++) {
        for (let i = 1, len = mergeStrings.length; i < len; i++) {
            let prefix = ''
            let suffix = `[tmp${i + 1}];`
            if (i === 0) {
                // prefix = '[base]'
                prefix = ''
            } else if (i === 1) {
                // remove if pad re-added
                prefix = '[layer_0]'
                // prefix='[tmp1]'
            } else {
                prefix = `[tmp${i}]`
            }
            if (i === (len - 1)) {
                suffix = `[vout];`
            }
            inputMediaString = inputMediaString.concat(prefix + mergeStrings[i] + suffix)
        }
        inputMediaString = inputMediaString.concat(`${audioString}amix=inputs=${inputsNum}[aout]`)

        inputArgs.push("-filter_complex")

        inputArgs.push(inputMediaString)

        inputArgs.push("-map")
        inputArgs.push("[vout]")
        inputArgs.push("-map")
        inputArgs.push("[aout]")
        
        if (params.filetype !== 'webm') {
            inputArgs.push('-preset')
            inputArgs.push('ultrafast')
        }
        inputArgs.push('-y')
        inputArgs.push(outputFile)

        if (params.verbose) {
            console.log('inputArgs', inputArgs)
        }

        await FfmpegProcessWasm(data, inputArgs, true)
        return fs.promises.writeFile('/data/' + outputFile, out)
    } catch (err) {
        throw err
    }
}

const FfmpegProcessWasm = async function(data, inputArgs, verbose=false) {
    try {
        // TODO: logger: () => {}
        // TODO: progress: () => {}
        const ffmpeg = createFFmpeg({ log: verbose })
        
        await ffmpeg.load();
        data.forEach((entry) => {
            ffmpeg.FS('writeFile', entry.name, entry.data);
        })
        await ffmpeg.run(...inputArgs);
        return ffmpeg.FS('readFile', '/data/' + outputFile);
    } catch (err) {
        throw err
    }
}

module.exports = PipLib
