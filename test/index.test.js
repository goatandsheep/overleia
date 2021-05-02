const Pip = require('../index');
const path = require('path');
const fs = require('fs').promises;

const settings = require('./settings');

describe('basic ffmpeg', () => {
    it('should process an MP4 file', () => {
        expect(async () => {
            const inputProms = [
                fs.readFile(path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.BASE_INPUT_MP4_FILENAME)),
                fs.readFile(path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.PIP_INPUT_MP4_FILENAME))
            ]
            const inputs = await Promise.all(inputProms)
            await Pip({
                    inputs,
                    template: {
                        views: [
                            {
                                x: 0,
                                y: 0,
                                height: 720
                            },
                            {
                                x: 10,
                                y: 10,
                                height: 250
                            }
                        ],
                        height: 720
                    },
                    verbose: true
                }
            )
        }).not.toThrow();
    })
    it('should process 4 videos', () => {
        expect(async () => {
            const inputProms = [
                fs.readFile(path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.BASE_INPUT_MP4_FILENAME)),
                fs.readFile(path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.PIP_INPUT_MP4_FILENAME)),
                fs.readFile(path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.BASE_INPUT_MP4_FILENAME)),
                fs.readFile(path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.PIP_INPUT_MP4_FILENAME))
            ]
            const inputs = await Promise.all(inputProms)
            await Pip({
                    inputs: [
                        settings.BASE_INPUT_MP4_FILENAME,
                        settings.PIP_INPUT_MP4_FILENAME,
                        settings.BASE_INPUT_MP4_FILENAME,
                        settings.PIP_INPUT_MP4_FILENAME
                    ],
                    template: {
                        views: [
                            {
                                x: 0,
                                y: 0,
                                height: 720
                            },
                            {
                                x: 10,
                                y: 10,
                                height: 250
                            },
                            {
                                x: 400,
                                y: 10,
                                height: 250
                            },
                            {
                                x: 400,
                                y: 400,
                                height: 250
                            }
                        ],
                        height: 720
                    },
                    verbose: true
                }
            )
        }).not.toThrow();
    })
})
