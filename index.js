const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const request = require('request');
const core = require('@actions/core');

function sendData(url, formData) {
  request.post({ url, formData }, function (error, response = {}) {  
    console.log('type', response);
    if (!error && response.statusCode < 300) {
      console.log('send file successfully');
      return;
    }
    console.error('send failed');
  });
}

// 只支持一级子目录
function addFileToZip(archive, dirPath, finish = false, dir) {
  let isEnd = finish;
  fs.readdir(dirPath, {
    withFileTypes: true
  }, (err, files) => {
    // console.log('s', files);
    files.forEach(file => {
      const filePath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        isEnd = false;
        addFileToZip(archive, filePath, true, file.name);
      } else {
        console.log('name:', file.name);
        if (/.+\.[txt|js|css|md|html|jpg|png|jpeg|gif]+$/.test(file.name)) {
          const buf = fs.createReadStream(filePath);
          archive.append(buf, {
            name: dir ? `${dir}/${file.name}` : file.name
          });
        }
      }
    });
    // pipe archive data to the file
    console.log('finish', isEnd);
    isEnd && archive.finalize();
  });
}

try {
  // `who-to-greet` input defined in action metadata file
  const name = core.getInput('name'); //  || 'dom'
  const token = core.getInput('token'); //  || 'dom.0909'
  const requestUrl = core.getInput('requestUrl');
  const dist = core.getInput('dist') || 'dist'; 
  const target = core.getInput('target') || 'dist'; 
  const time = (new Date()).toTimeString();

  if (!name || !token) {
    console.error('name and token is nessary');
    return;
  }

  const formData = {
    name,
    token,
    target,
    requestUrl,
  };
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });
  const zipPath = path.join(dist, `/${target}.zip`);
  console.log('zip:', zipPath, formData, time);

  const out = fs.createWriteStream(zipPath);

  addFileToZip(archive, dist, true);

  out.on('close', () => {
    formData.file = fs.createReadStream(zipPath);
    console.log('get success');
    sendData(requestUrl, formData);
  });
  archive.pipe(out);
  // some wrong info
  // console.log('message', message);
} catch (error) {
  core.setFailed(error.message);
}