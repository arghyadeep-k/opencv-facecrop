const { Canvas, createCanvas, Image, ImageData, loadImage } = require('canvas');
const { JSDOM } = require('jsdom');
const { writeFileSync, existsSync, statSync } = require('fs');



module.exports = async (file, name = "output.jpg", type = "image/jpeg", quality = 0.95, factor = 0, trainingSet = "./node_modules/opencv-facecrop/resources/haarcascade_frontalface_default.xml") => {
  let image, src, gray, faces, faceCascade;
  try {
    await loadOpenCV().catch((e) => { throw new Error("Error: Loading OpenCV failed.\n" + e.message) });
    console.log("Loading file...");
    image = await loadImage(file)
      .catch((e) => { throw new Error("Error: Loading input image failed.\n" + e.message) });
    if (image != null)
      src = cv.imread(image);
    gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    faces = new cv.RectVector();
    faceCascade = new cv.CascadeClassifier();

    console.log("Loading pre-trained classifier files...");

    try {
      statSync(trainingSet);
    }
    catch (err) {
      throw new Error("Error: Pre-Trained Classifier file failed to load.\n" + err.message);
    }

    faceCascade.load(trainingSet);

    console.log("Processing...")
    let mSize = new cv.Size(0, 0);
    faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, mSize, mSize);

    let point1, point2;

    for (let i = 0; i < faces.size(); ++i) {
      point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
      point2 = new cv.Point(faces.get(i).x + faces.get(i).width, faces.get(i).y + faces.get(i).height);

      point1.x = point1.x - factor;
      point1.y = point1.y - factor;

      point2.x = point2.x + factor;
      point2.y = point2.y + factor;

      if (point1.x < 0 || point1.y < 0 || point2.x < 0 || point2.y < 0)
        throw new Error('Error: Factor passed is too high/low.');

      const canvas = createCanvas(point2.x - point1.x, point2.y - point1.y);

      let rect = new cv.Rect(point1.x, point1.y, point2.x - point1.x, point2.y - point1.y);

      console.log('Rendering output image...')
      let dst = src.roi(rect);

      console.log("Source File dimension: " + src.size().width + "x" + src.size().height);
      console.log("Destination File dimension: " + dst.size().width + "x" + dst.size().height);

      cv.imshow(canvas, dst);

      let outputFilename = name.toString();

      if (faces.size() > 1) {
        if (outputFilename.charAt(outputFilename.length - 4) == '.')
          outputFilename = outputFilename.substr(0, (outputFilename.length - 4)) + `-${i + 1}` + outputFilename.substr((outputFilename.length - 4), 4);
        else
          throw new Error('Error: File extension should be 3 characters only.');
      }

      writeFileSync(outputFilename, canvas.toBuffer(type, { quality: quality }));
      console.log(outputFilename + " created successfully.");

    }
    return "Success";
  }
  catch (e) {
    console.error(e.message);
    return e.message;
  }
  finally {
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
    return Promise.resolve()
  }
  return new Promise(resolve => {
    installDOM()
    global.Module = {
      onRuntimeInitialized() {
        // We change emscripten current work directory to 'rootDir' so relative paths are resolved
        // relative to the current local folder, as expected
        cv.FS.chdir(rootDir)
        resolve()
      },
      preRun() {
        // preRun() is another callback like onRuntimeInitialized() but is called just before the
        // library code runs. Here we mount a local folder in emscripten filesystem and we want to
        // do this before the library is executed so the filesystem is accessible from the start
        const FS = global.Module.FS
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
      }
    };
    global.cv = require('opencv4js')
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