const Pip = require('../index');
const path = require('path');
const fs = require('fs').promises;

const settings = require('./settings');

describe('basic ffmpeg', () => {
    // test 1 
    it('should process an MP4 file', () => {
        const prom = Pip({
            inputs: [
              path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.PIP_INPUT_IMG_FILENAME),
              path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.BASE_INPUT_MP4_FILENAME),
              path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.PIP_INPUT_MP4_FILENAME)
            ],
            output: path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.PIP_OUTPUT_FILENAME),
            template: {
              "height": 720,
              "id": "0ac5c561-15dd-41d6-8448-41b427f9c1d8",
              "name": "bottom-middle-box",
              "views": [
                {
                  "height": 250,
                  "x": 45,
                  "y": 45
                },
                {
                  "height": 250,
                  "x": 766,
                  "y": 45
                },
                {
                  "height": 250,
                  "x": 408,
                  "y": 387
                }
              ]
            }
          })
        return expect(prom).resolves.toBe(true);
    })

    // test 2
    it('should process 4 videos', async () => {
        
        const myProm = Pip({
            inputs: [
                    path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.BASE_INPUT_MP4_FILENAME),
                    path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.PIP_INPUT_MP4_FILENAME),
                    path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.BASE_INPUT_MP4_FILENAME),
                    path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.PIP_INPUT_MP4_FILENAME)
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
                }
        })
        return expect(myProm).resolves.toBe(true);
        
    })
})
