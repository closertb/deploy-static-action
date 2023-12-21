
const fs = require('fs');
const path = require('path');

const isLegalFileType = path => /.+\.(txt|js|css|md|html|jpg|png|jpeg|gif|ico|json|less|webp|map)+$/.test(path);

let endFlag = 1;

module.exports = function addFileToZip(archive, params) {
  // dirPath 可能是文件夹名 也可能是文件名
  const { dirPath, root = '', home = '', loop, finalize } = params;

  // 如果是文件类型
  if (isLegalFileType(dirPath)) {
    const buf = fs.createReadStream(path.join(home, dirPath));
    archive.append(buf, {
      name: path.join(root, dirPath)
    });
    finalize && archive.finalize();
    return;
  }

  // 赋默认值
  if (!loop) {
    endFlag = 1;
  }

  fs.readdir(path.join(home, dirPath), {
    withFileTypes: true
  }, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    endFlag -= 1; // 遍历一次目录减1
    files.forEach((file) => {
      const filePath = path.join(home, dirPath, file.name);
      if (file.isDirectory()) {
        endFlag += 1;
        addFileToZip(archive, {
          dirPath: filePath,
          root: path.join(root, file.name),
          finalize,
          loop: true,
        });
      } else if (isLegalFileType(file.name)) {
        console.log('filtPath:', filePath);
        const buf = fs.createReadStream(filePath);
        archive.append(buf, {
          name: path.join(root, file.name)
        });
      }
    });
    // pipe archive data to the file
    // console.log('close:', endFlag);
    finalize && (endFlag === 0) && archive.finalize();
  });
};
