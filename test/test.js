const facecrop = require('../index')
const fs = require('fs')

test('Single face detection', async() => {
  expect.assertions(1);
  await facecrop('./test/test-file-1.jpg', {name: './test/output.jpg', type: "image/jpeg", quality: 0.95});
  return expect(isExists1("./test/output.jpg")).toBeTruthy();
});

test('Multiple face detection', async() => {
  expect.assertions(1);
  await facecrop('./test/test-file-2.jpg', {name: './test/output.jpg', type: "image/jpeg", quality: 0.95});
  return expect(isExists2("./test/output-1.jpg", "./test/output-2.jpg")).toBeTruthy();
});

async function isExists1(filename){
  fs.stat(filename,(err) => {
    if (err == null)
        return true;
    else
        return false;
  });
}

async function isExists2(file1, file2){
  fs.stat(file1,(err1) => {
    if (err1 == null){
      fs.stat(file2, (err2) => {
        if(err2 == null)
          return true;
        else
          return false;
      });
    }
    else
        return false;
  });
}