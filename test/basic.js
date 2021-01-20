const Pip = require('../index');

const settings = require('./settings');
Pip({
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
                y: 100,
                height: 620
            },
            {
                x: 10,
                y: 10,
                height: 250,
                delay: 1
            },
            {
                x: 10,
                y: 400,
                height: 250,
                delay: 2
            },
            {
                x: 400,
                y: 400,
                height: 250,
                delay: 3
            }
        ],
        height: 720
    }
},
settings.INPUT_DIRECTORY
)