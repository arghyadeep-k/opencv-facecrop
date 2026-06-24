const facecrop = require('../index');
const fs = require('fs');

const TRAINING_SET = './resources/haarcascade_frontalface_default.xml';
const GENERATED_FILES = [
  './test/out.jpg',
  './test/output.jpg',
  './test/output-1.jpg',
  './test/output-2.jpg',
];

afterAll(() => {
  for (const f of GENERATED_FILES) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
});

test('Single face detection', async () => {
  await facecrop('./test/test-file-1.jpg', './test/out.jpg', 'image/jpeg', 0.95, 1, TRAINING_SET);
  return expect(fs.existsSync('./test/out.jpg')).toBe(true);
});

test('Multiple face detection', async () => {
  await facecrop(
    './test/test-file-2.jpg',
    './test/output.jpg',
    'image/jpeg',
    0.95,
    1,
    TRAINING_SET
  );
  return expect(fs.existsSync('./test/output-1.jpg') && fs.existsSync('./test/output-2.jpg')).toBe(
    true
  );
});

test('Return value', async () => {
  let out = await facecrop(
    './test/test-file-1.jpg',
    './test/out.jpg',
    'image/jpeg',
    0.95,
    1.1,
    TRAINING_SET
  );
  return expect(out).toMatch('Success');
});

test('Default bundled classifier resolves', async () => {
  // trainingSet omitted on purpose: the default must resolve to the bundled file.
  let out = await facecrop('./test/test-file-1.jpg', './test/out.jpg');
  return expect(out).toMatch('Success');
});

test('Invalid input image parameter', async () => {
  let out = await facecrop('./invalid-file-name');
  return expect(out).toMatch('Error: Loading input image failed');
});

test('Invalid training set path', async () => {
  let out = await facecrop(
    './test/test-file-1.jpg',
    './test/out.jpg',
    'image/jpeg',
    0.95,
    1,
    './resources/does-not-exist.xml'
  );
  return expect(out).toMatch('Pre-Trained Classifier file failed to load.');
});

test('Factor out of bounds', async () => {
  let out = await facecrop(
    './test/test-file-1.jpg',
    './test/output.jpg',
    'image/jpeg',
    0.95,
    -10,
    TRAINING_SET
  );
  return expect(out).toMatch('Factor passed is too low, should be greater than 0.');
});
