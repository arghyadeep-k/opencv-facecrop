const facecrop = require('../index')
const fs = require('fs')

test('Single face detection', async () => {
  //expect.assertions(1);
  await facecrop('./test/test-file-1.jpg', './test/out.jpg', "image/jpeg", 0.95, 100, './resources/haarcascade_frontalface_default.xml');
  return expect(isExists1("./test/out.jpg")).toBeTruthy();
});

test('Multiple face detection', async () => {
  //expect.assertions(1);
  await facecrop('./test/test-file-2.jpg', './test/output.jpg', "image/jpeg", 0.95, 0, './resources/haarcascade_frontalface_default.xml');
  return expect(isExists2("./test/output-1.jpg", "./test/output-2.jpg")).toBeTruthy();
});

test('Return value', async () => {
  let out = await facecrop('./test/test-file-1.jpg', './test/out.jpg', "image/jpeg", 0.95, 100, './resources/haarcascade_frontalface_default.xml');
  return expect(out).toMatch('Success');
});

test('Invalid input image parameter', async () => {
  let out = await facecrop('./invalid-file-name');
  return expect(out).toMatch("Error: Loading input image failed");
});

test('Invalid training set path', async () => {
  let out = await facecrop('./test/test-file-1.jpg', './test/out.jpg', "image/jpeg", 0.95);
  return expect(out).toMatch("Pre-Trained Classifier file failed to load.");
  // .rejects
  // .toThrow("no such file or directory, stat './node_modules/opencv-facecrop/resources/haarcascade_frontalface_default.xml'");
});

test('Invalid output extension', async () => {
  let out = await facecrop('./test/test-file-2.jpg', './test/output.jpeg', "image/jpeg", 0.95, 0, './resources/haarcascade_frontalface_default.xml')
  return expect(out).toMatch("File extension should be 3 characters only.");
  // .rejects
  // .toThrow("File extension should be 3 characters only.")
});

test('Factor out of bounds', async () => {
  let out = await facecrop('./test/test-file-1.jpg', './test/output.jpg', "image/jpeg", 0.95, 1000, './resources/haarcascade_frontalface_default.xml');
  return expect(out).toMatch("Factor passed is too high/low.");
});

async function isExists1(filename) {
  fs.stat(filename, (err) => {
    return err == null ? true : false;
  });
}

async function isExists2(file1, file2) {
  fs.stat(file1, (err1) => {
    if (err1 == null) {
      fs.stat(file2, (err2) => {
        return err2 == null ? true : false;
      });
    }
    else
      return false;
  });
}