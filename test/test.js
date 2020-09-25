const facecrop = require('../index')
const fs = require('fs')

test('Single face detection', async() => {
  expect.assertions(1);
  await facecrop('./test/test-file-1.jpg', './test/output.jpg', "image/jpeg", 0.95, './resources/haarcascade_frontalface_default.xml');
  return expect(isExists1("./test/output.jpg")).toBeTruthy();
});

test('Multiple face detection', async() => {
  expect.assertions(1);
  await facecrop('./test/test-file-2.jpg', './test/output.jpg', "image/jpeg", 0.95, './resources/haarcascade_frontalface_default.xml');
  return expect(isExists2("./test/output-1.jpg", "./test/output-2.jpg")).toBeTruthy();
});

test('Invalid output extension', async() => {  
  try{
    await facecrop('./test/test-file-2.jpg', './test/output.jpeg', "image/jpeg", 0.95, './resources/haarcascade_frontalface_default.xml');
  }
  catch(e){
    expect(e.toString()).toMatch("ERROR: File extension should be 3 characters only.")
  }
});

async function isExists1(filename){
  fs.stat(filename,(err) => {    
    return err == null ? true : false;    
  });
}

async function isExists2(file1, file2){
  fs.stat(file1,(err1) => {
    if (err1 == null){
      fs.stat(file2, (err2) => { 
        return err2 == null ? true : false;            
      });
    }
    else
        return false;
  });
}