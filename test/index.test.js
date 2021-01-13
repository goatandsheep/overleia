const Pip = require('../index');

const settings = require('./settings');

describe('basic ffmpeg', () => {
    it('should process an MP4 file', () => {
        expect(() => {
            Pip(settings.INPUT_DIRECTORY,
                settings.BASE_INPUT_MP4_FILENAME,
                settings.BASE_INPUT_MP4_FILENAME)
        }).not.toThrow();
    })
})
