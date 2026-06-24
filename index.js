const { Canvas, createCanvas, Image, ImageData, loadImage } = require('canvas');
const { JSDOM } = require('jsdom');
const { existsSync, statSync, mkdirSync, promises: fsPromises } = require('fs');
const path = require('path');

// detectMultiScale tuning parameters.
const SCALE_FACTOR = 1.1; // How much the image size is reduced at each image scale.
const MIN_NEIGHBORS = 3; // How many neighbors each candidate rectangle should have to be retained.

// The Haar cascade classifier shipped with this package. opencv4js reads files
// through an emscripten filesystem that only exposes the current working directory,
// so the path is expressed relative to process.cwd() rather than as an absolute
// host path. Resolving from __dirname (instead of a hardcoded node_modules string)
// keeps this working across pnpm/nested install layouts as long as the package lives
// under the consumer's working directory.
const DEFAULT_TRAINING_SET = path.relative(
  process.cwd(),
  path.join(__dirname, 'resources', 'haarcascade_frontalface_default.xml')
);

module.exports = async (
  file,
  name = 'output.jpg',
  type = 'image/jpeg',
  quality = 0.95,
  factor = 1,
  trainingSet = DEFAULT_TRAINING_SET,
  verbose = false
) => {
  const log = (...args) => {
    if (verbose) console.log(...args);
  };

  let src, gray, faces, faceCascade;
  try {
    if (!file) throw new Error('Error: Input file is required.');
    if (factor <= 0)
      throw new Error('Error: Scaling Factor passed is too low, should be greater than 0.');
    if (quality <= 0 || quality > 1)
      throw new Error('Error: Quality must be a value greater than 0 and up to 1.');

    await loadOpenCV().catch((e) => {
      throw new Error('Error: Loading OpenCV failed.\n' + e.message);
    });

    const image = await loadImage(file).catch((e) => {
      throw new Error('Error: Loading input image failed.\n' + e.message);
    });

    src = cv.imread(image);
    gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    faces = new cv.RectVector();
    faceCascade = new cv.CascadeClassifier();

    try {
      statSync(trainingSet);
    } catch (err) {
      throw new Error('Error: Pre-Trained Classifier file failed to load.\n' + err.message, {
        cause: err,
      });
    }

    faceCascade.load(trainingSet);

    log('Processing...');
    const mSize = new cv.Size(0, 0);
    faceCascade.detectMultiScale(gray, faces, SCALE_FACTOR, MIN_NEIGHBORS, 0, mSize, mSize);

    if (faces.size() === 0) {
      return 'No faces detected.';
    }

    for (let i = 0; i < faces.size(); ++i) {
      const face = faces.get(i);
      const point1 = new cv.Point(face.x, face.y);
      const point2 = new cv.Point(face.x + face.width, face.y + face.height);

      // Expand the crop box by `factor`. width == height for the frontal-face cascade.
      let offset = Math.floor(face.width * (factor - 1));

      // Clamp the offset so the crop stays within the source image bounds.
      if (point1.x < offset) offset = point1.x;
      if (point1.y < offset) offset = point1.y;
      if (image.height < point2.y + offset) offset = image.height - point2.y;
      if (image.width < point2.x + offset) offset = image.width - point2.x;

      point1.x -= offset;
      point1.y -= offset;
      point2.x += offset;
      point2.y += offset;

      const canvas = createCanvas(point2.x - point1.x, point2.y - point1.y);
      const rect = new cv.Rect(point1.x, point1.y, point2.x - point1.x, point2.y - point1.y);

      log('Rendering output image...');
      const dst = src.roi(rect);

      log('Source File dimension: ' + src.size().width + 'x' + src.size().height);
      log('Destination File dimension: ' + dst.size().width + 'x' + dst.size().height);

      cv.imshow(canvas, dst);

      let outputFilename = name.toString();
      if (faces.size() > 1) {
        const baseName = outputFilename.replace(/\.[^/.]+$/, '');
        outputFilename = outputFilename.replace(baseName, baseName + `-${i + 1}`);
      }

      await fsPromises.writeFile(outputFilename, canvas.toBuffer(type, { quality }));
      log(outputFilename + ' created successfully.');

      dst.delete();
    }
    return 'Success';
  } catch (e) {
    if (verbose) console.error(e.message);
    return e.message;
  } finally {
    if (src) src.delete();
    if (gray) gray.delete();
    if (faceCascade) faceCascade.delete();
    if (faces) faces.delete();
  }
};

/**
 * Loads opencv.js.
 *
 * Installs HTML Canvas emulation to support `cv.imread()` and `cv.imshow`
 *
 * Mounts given local folder `localRootDir` in emscripten filesystem folder `rootDir`. By default it will mount the local current directory in emscripten `/work` directory. This means that `/work/foo.txt` will be resolved to the local file `./foo.txt`
 * @param {string} rootDir The directory in emscripten filesystem in which the local filesystem will be mount.
 * @param {string} localRootDir The local directory to mount in emscripten filesystem.
 * @returns {Promise} resolved when the library is ready to use.
 */
function loadOpenCV(rootDir = '/work', localRootDir = process.cwd()) {
  if (global.Module && global.Module.onRuntimeInitialized && global.cv && global.cv.imread) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    installDOM();
    global.Module = {
      onRuntimeInitialized() {
        // We change emscripten current work directory to 'rootDir' so relative paths are resolved
        // relative to the current local folder, as expected
        cv.FS.chdir(rootDir);
        resolve();
      },
      preRun() {
        // preRun() is another callback like onRuntimeInitialized() but is called just before the
        // library code runs. Here we mount a local folder in emscripten filesystem and we want to
        // do this before the library is executed so the filesystem is accessible from the start
        const FS = global.Module.FS;
        // create rootDir if it doesn't exists
        if (!FS.analyzePath(rootDir).exists) {
          FS.mkdir(rootDir);
        }
        // create localRootFolder if it doesn't exists
        if (!existsSync(localRootDir)) {
          mkdirSync(localRootDir, { recursive: true });
        }
        // FS.mount() is similar to Linux/POSIX mount operation. It basically mounts an external
        // filesystem with given format, in given current filesystem directory.
        FS.mount(FS.filesystems.NODEFS, { root: localRootDir }, rootDir);
      },
    };
    global.cv = require('opencv4js');
  });
}

function installDOM() {
  const dom = new JSDOM();
  global.document = dom.window.document;
  global.Image = Image;
  global.HTMLCanvasElement = Canvas;
  global.ImageData = ImageData;
  global.HTMLImageElement = Image;
}
