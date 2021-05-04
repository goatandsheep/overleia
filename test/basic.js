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
          y: 0,
          height: 733,
          width: 1303,
        },
        {
          x: 10.3451,
          y: 10.435234,
          height: 250.5434,
          delay: 1,
        },
        {
          x: 78.0982905982906,
          y: 482.1267806267807,
          height: 180.14672364672367,
          width: 320.72364672364677,
          delay: 2,
        },
        {
          x: 400,
          y: 400,
          height: 250,
          delay: 3,
        },
      ],
      height: 733,
      width: 1303,
    },
  }).then(out => {
      fs.writeFile(outPath, out).then(() => {
          process.exit(0)
      })})
});
