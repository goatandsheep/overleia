const Pip = require('../index');
const path = require('path');
const fs = require('fs').promises;

const settings = require('./settings');

describe('basic ffmpeg', () => {
    it('should process an MP4 file', () => {
        return expect(async () => {
            const inputProms = [
                fs.readFile(path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.BASE_INPUT_MP4_FILENAME)),
                fs.readFile(path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.PIP_INPUT_MP4_FILENAME))
            ]
            const inputs = await Promise.all(inputProms)
            const out = await Pip({
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
            console.log('pathy1', path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.BASE_INPUT_MP4_FILENAME))
            return fs.writeFile('completed1.mp4', out)
        }).resolves.toBe(true);
    })
    it('should process 4 videos', async () => {
        const inputProms = [
            fs.readFile(path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.BASE_INPUT_MP4_FILENAME)),
            fs.readFile(path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.PIP_INPUT_MP4_FILENAME)),
            fs.readFile(path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.BASE_INPUT_MP4_FILENAME)),
            fs.readFile(path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.PIP_INPUT_MP4_FILENAME))
        ]
        const inputs = await Promise.all(inputProms)
        const out = await Pip({
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
        })
        console.log('pathy2', path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.BASE_INPUT_MP4_FILENAME))
        return expect(fs.writeFile('completed2.mp4', out)).resolves.toBe(true);
    })
})
