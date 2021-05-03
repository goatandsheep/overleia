const Pip = require("../index");
const path = require("path");
const fs = require("fs").promises;

const settings = require("./settings");

const outPath = path.join(__dirname, '..', settings.INPUT_DIRECTORY, 'completed.mp4')
const inputProms = [
  fs.readFile(
    path.join(
      __dirname,
      "..",
      settings.INPUT_DIRECTORY,
      settings.BASE_INPUT_MP4_FILENAME
    )
  ),
  fs.readFile(
    path.join(
      __dirname,
      "..",
      settings.INPUT_DIRECTORY,
      settings.PIP_INPUT_MP4_FILENAME
    )
  ),
  fs.readFile(
    path.join(
      __dirname,
      "..",
      settings.INPUT_DIRECTORY,
      settings.BASE_INPUT_MP4_FILENAME
    )
  ),
  fs.readFile(
    path.join(
      __dirname,
      "..",
      settings.INPUT_DIRECTORY,
      settings.PIP_INPUT_MP4_FILENAME
    )
  ),
];
Promise.all(inputProms).then((ins) => {
  Pip({
    inputs: ins,
    template: {
      views: [
        {
          x: 0,
          y: 100,
          height: 620,
        },
        {
          x: 10,
          y: 10,
          height: 250,
          delay: 1,
        },
        {
          x: 10,
          y: 400,
          height: 250,
          delay: 2,
        },
        {
          x: 400,
          y: 400,
          height: 250,
          delay: 3,
        },
      ],
      height: 720,
    },
  }).then(out => {
      fs.writeFile(outPath, out).then(() => {
          process.exit(0)
      })})
});
