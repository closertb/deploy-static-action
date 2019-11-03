const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const request = require('request');
const core = require('@actions/core');

function sendData(url, formData) {
  request.post({ url, formData }, function (error, response = {}, body) {  
    console.log('mesage', body);
    if (!error && response.statusCode < 300) {
      console.log('send file successfully');
      return;
    }
    console.error('send file failed');
  });
}

let endFlag = 1; // 遍历完成标志

// 只支持一级子目录
function addFileToZip(archive, dirPath, dir) {
  fs.readdir(dirPath, {
    withFileTypes: true
  }, (err, files) => {
    endFlag -= 1; // 遍历一次目录减1
    files.forEach(file => {
      const filePath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        endFlag +=1;
        addFileToZip(archive, filePath, file.name);
      } else {
        if (/.+\.[txt|js|css|md|html|jpg|png|jpeg|gif|ico]+$/.test(file.name)) {
          const buf = fs.createReadStream(filePath);
          archive.append(buf, {
            name: dir ? `${dir}/${file.name}` : file.name
          });
        }
      }
    });
    // pipe archive data to the file
    console.log('close:', endFlag);
    (endFlag === 0) && archive.finalize();
  });
}

try {
  // `who-to-greet` input defined in action metadata file
  const name = core.getInput('name'); //  || 'dom'
  const token = core.getInput('token'); //  || 'dom.0909'
  const requestUrl = core.getInput('requestUrl');
  const dist = core.getInput('dist') || 'dist'; 
  const target = core.getInput('target') || 'dist'; 

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
  const out = fs.createWriteStream(zipPath);
  out.on('close', () => {
    formData.file = fs.createReadStream(zipPath);
    console.log('start send zip files');
    sendData(requestUrl, formData);
  });
  archive.pipe(out);
  // add file to zip
  addFileToZip(archive, dist);
} catch (error) {
  core.setFailed(error.message);
}