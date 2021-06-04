const Pip = require("../index");
const path = require("path");
const fs = require("fs").promises;

const settings = require("./settings");

// Path-based process

Pip({
  inputs: [
    path.join(__dirname, '..', settings.INPUT_DIRECTORY, settings.BASE_INPUT_MP4_FILENAME),
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
  },
  verbose: true
}).then(val => {
  console.log('response', val)
})

// Buffer-based process
/*
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
  // fs.readFile(
  //   path.join(
  //     __dirname,
  //     "..",
  //     settings.INPUT_DIRECTORY,
  //     settings.PIP_INPUT_MP4_FILENAME
  //   )
  // ),
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
      "height": 720,
      "id": "0ac5c561-15dd-41d6-8448-41b427f9c1d8",
      "name": "bottom-middle-box",
      "views": [
        {
          "height": 250,
          "x": 45,
          "y": 88
        },
        {
          "height": 250,
          "x": 766,
          "y": 84
        },
        {
          "height": 250,
          "x": 408,
          "y": 387
        }
      ]
    },
    verbose: true
  }).then(out => {
      fs.writeFile(outPath, out).then(() => {
          process.exit(0)
      })})
});
*/
