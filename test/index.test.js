const Pip = require('../index');

const settings = require('./settings');

describe('basic ffmpeg', () => {
    it('should process an MP4 file', () => {
        expect(() => {
            Pip({
                    inputs: [
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
                            }
                        ],
                        height: 720
                    }
                },
                settings.INPUT_DIRECTORY
            )
        }).not.toThrow();
    })
})
