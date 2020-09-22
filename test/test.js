const facecrop = require('../index')
const fs = require('fs')

async function vanessa(){
    await facecrop('./test/test-file-1.jpg', {name: './test/output.jpg', type: "image/jpeg", quality: 0.95});
    
    fs.stat("./test/output.jpg",(err) => {
        if (err == null)
            console.log('SUCCESS: First Test Case Passed.');
        else if(err.code === 'ENOENT')
            console.error(err +"\nERROR: File not created. First Test Case Failed.");
        else
            console.error(err +"\nERROR: First Test Case Failed.");
    });

    await facecrop('./test/test-file-2.jpg', {name: './test/output.jpg', type: "image/jpeg", quality: 0.95});

    fs.stat("./test/output-1.jpg",(err1) => {
        if (err1 == null){
            fs.stat("./test/output-2.jpg",(err2) => {
                if (err2 == null)
                    console.log('SUCCESS: Second Test Case Passed.');
                else if(err2.code === 'ENOENT')
                    console.error(err2 +"\nERROR: File not created. Second Test Case Failed.");
                else
                    console.error(err2 +"\nERROR: Second Test Case Failed.");
            });
        }            
        else if(err1.code === 'ENOENT')
            console.error(err1 +"\nERROR: File not created. Second Test Case Failed.");
        else
            console.error(err1 +"\nERROR: Second Test Case Failed.");
    });

}

vanessa();