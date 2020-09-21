const facecrop = require('../index')
const fs = require('fs')

async function vanessa(){
    await facecrop('./test/test-file.jpg', {name: './test/output.jpg', type: "image/jpeg", quality: 0.95 });

    fs.stat("./test/output.jpg",(err,stat) => {
        if (err == null)
            console.log('SUCCESS: Test Case Passed.');
        else if(err.code === 'ENOENT')
            console.log(err +"\nERROR: File not created. Test Case Failed.");
        else
            console.log(err +"\nERROR: Test Case Failed.");
    });
}

vanessa();