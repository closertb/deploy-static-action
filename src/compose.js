
const fs = require('fs');
const path = require('path');

let endFlag = 1; // 遍历完成标志

module.exports = function addFileToZip(archive, dirPath, root = '') {
  fs.readdir(dirPath, {
    withFileTypes: true
  }, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    endFlag -= 1; // 遍历一次目录减1
    files.forEach((file) => {
      const filePath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        endFlag += 1;
        addFileToZip(archive, filePath, path.join(root, file.name));
      } else if (/.+\.[txt|js|css|md|html|jpg|png|jpeg|gif|ico]+$/.test(file.name)) {
        const buf = fs.createReadStream(filePath);
        archive.append(buf, {
          name: path.join(root, file.name)
        });
      }
    });
    // pipe archive data to the file
    // console.log('close:', endFlag);
    (endFlag === 0) && archive.finalize();
  });
};
