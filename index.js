const { Canvas, createCanvas, Image, ImageData, loadImage } = require('canvas');
const { JSDOM } = require('jsdom');
const { writeFileSync, existsSync, readFileSync } = require('fs');



module.exports = async (file, options = { name: "output.jpg", type: "image/jpeg", quality: 0.95 }) => {
  await loadOpenCV();
  console.log("Loading file...")
  const image = await loadImage(file);
  const src = cv.imread(image);
  let gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
  let faces = new cv.RectVector();
  let faceCascade = new cv.CascadeClassifier();

  // Load pre-trained classifier files. Notice how we reference local files using relative paths just
  // like we normally would do
  console.log("Loading pre-trained classifier files...");
  faceCascade.load('./resources/haarcascade_frontalface_default.xml');

  console.log("Processing...")
  let mSize = new cv.Size(0, 0);
  faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, mSize, mSize);
  
  let point1, point2;  

  for (let i = 0; i < faces.size(); ++i) {    
    point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
    point2 = new cv.Point(faces.get(i).x + faces.get(i).width, faces.get(i).y + faces.get(i).height);  
    
    const canvas = createCanvas(point2.x - point1.x, point2.y - point1.y);
    
    let rect = new cv.Rect(point1.x, point1.y, point2.x - point1.x, point2.y - point1.y);

    console.log('Rendering file...')
    let dst = src.roi(rect);
    
    console.log("Source File dimension: " + src.size().width + "x" + src.size().height);
    console.log("Destination File dimension: " + dst.size().width + "x" + dst.size().height);
        
    cv.imshow(canvas, dst);    
    
    let name = options['name'].toString();

    if(faces.size() > 1){
      if(name.charAt(name.length - 4) == '.'){
        name = name.substr(0, (name.length - 4)) + `-${i+1}` + name.substr((name.length - 4), 4);        
      }
      else {
        throw new Error('ERROR: File extension should be 3 characters only.');
      }
    }

    writeFileSync(name, canvas.toBuffer(options['type'],{ quality: options['quality'] }));    
    console.log(name + " created successfully.");
  }  
  src.delete(); gray.delete(); faceCascade.delete(); faces.delete(); 
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
  if(global.Module && global.Module.onRuntimeInitialized && global.cv && global.cv.imread) {
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
        if(!FS.analyzePath(rootDir).exists) {
          FS.mkdir(rootDir);
        }
        // create localRootFolder if it doesn't exists
        if(!existsSync(localRootDir)) {
          mkdirSync(localRootDir, { recursive: true});
        }
        // FS.mount() is similar to Linux/POSIX mount operation. It basically mounts an external
        // filesystem with given format, in given current filesystem directory.
        FS.mount(FS.filesystems.NODEFS, { root: localRootDir}, rootDir);
      }
    };
    global.cv = require('./resources/opencv.js')
  });
}
function installDOM(){
  const dom = new JSDOM();
  global.document = dom.window.document;
  global.Image = Image;
  global.HTMLCanvasElement = Canvas;
  global.ImageData = ImageData;
  global.HTMLImageElement = Image;
}