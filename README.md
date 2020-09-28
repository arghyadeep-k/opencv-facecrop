# OpenCv - Face Crop : Autodetect & crop faces out of an image (Node.js)

![CI](https://github.com/arghyadeep-k/opencv-facecrop/workflows/CI/badge.svg?branch=master)
![codecov.io](https://codecov.io/github/arghyadeep-k/opencv-facecrop/coverage.svg?branch=master)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=arghyadeep-k_opencv-facecrop&metric=alert_status)](https://sonarcloud.io/dashboard?id=arghyadeep-k_opencv-facecrop)
![npm](https://img.shields.io/npm/v/opencv-facecrop)
![npm bundle size](https://img.shields.io/bundlephobia/min/opencv-facecrop)
![Libraries.io SourceRank](https://img.shields.io/librariesio/sourcerank/npm/opencv-facecrop)
![Depfu](https://img.shields.io/depfu/arghyadeep-k/opencv-facecrop)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/opencv-facecrop)
![npm](https://img.shields.io/npm/dt/opencv-facecrop)
![NPM](https://img.shields.io/npm/l/opencv-facecrop?color=blue)


This package helps you to auto-detect faces in a picture and crop them out.

## Installation

[![NPM](https://nodei.co/npm/opencv-facecrop.png)](https://nodei.co/npm/opencv-facecrop/)

**Install from command line:**

`npm install --save opencv-facecrop`



## Basic Usage
```javascript
const facecrop = require('opencv-facecrop');

facecrop('./image-file.jpg', './dest/output.jpg', "image/jpeg", 0.95, 50);

/* 
Outputs image with file name output.jpg in 'dest' folder with the face cropped out.

If multiple faces are detected, the files will be automatically renamed to output-1.jpg, output-2.jpg and so on.
*/
```

## Results

Original Image:

<img src="https://github.com/arghyadeep-k/resources/raw/master/opencv-facecrop_test-file-1.jpg">

<br><br>
Cropped Image:

<img src="https://github.com/arghyadeep-k/resources/raw/master/opencv-facecrop_test-file-1-output.jpg" width=250px>

Image by <a href="https://pixabay.com/photos/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=919048">Free-Photos</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=919048">Pixabay</a>

## API
**facecrop(input_filename, output_filename, type, quality, factor)**

- **input_filename**: Input String containing file name with relative/absolute filepath.

- **output_filename**: (Optional) Requires a string value which will contains the output file name.

- **type**: (Optional) Requires String value which will tell the format of the output image.

- **quality**: (Optional) Requires a float value between 0 to 1 which stands for the quality index of the output file compares to the input file. Set 1 for no reduction in quality.

- **factor**: (Optional) Pixels by which the area of cropping of the face should be increased to add more details. Use -ve value to decrease.

## Defaults 

 - **input_filename**: Mandatory parameter
 - **output_filename**: "./output.jpg"
 - **type**: 'image/jpeg'
 - **quality**: 0.95
 - **factor**: 0

## Changelogs:
To view the changelogs, please refer to the <a href="https://github.com/arghyadeep-k/opencv-facecrop/releases">Github Releases page</a> of this project.

## License

OpenCv - Face Crop is published under the Unlicense. For more information, see the accompanying LICENSE file. 

<br>

---

<br>

P.S. - This is a pre-release version. More updates with refinements coming soon.
