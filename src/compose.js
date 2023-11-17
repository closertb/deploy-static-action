
const fs = require('fs');
const path = require('path');

const isLegalFileType = (path) => /.+\.(txt|js|css|md|html|jpg|png|jpeg|gif|ico|json|less|webp|map)+$/.test(path);

module.exports = function addFileToZip(archive, params) {
  // dirPath 可能是文件夹名 也可能是文件名
  const { dirPath, root = '', home = '', ...others } = params;
  // 赋默认值
  if (others.endFlag === undefined) {
    others.endFlag = 1;
  }

  // 赋默认值
  if (others.finalize === undefined) {
    others.finalize = false;
  }
  // 如果是文件类型
  if (isLegalFileType(dirPath)) {
    const buf = fs.createReadStream(path.join(home, dirPath));
    archive.append(buf, {
      name: path.join(root, dirPath)
    });
    others.finalize && (others.endFlag === 0) && archive.finalize();
    return;
  }
  fs.readdir(path.join(home, dirPath), {
    withFileTypes: true
  }, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    others.endFlag = others.endFlag - 1; // 遍历一次目录减1
    files.forEach((file) => {
      const filePath = path.join(home, dirPath, file.name);
      if (file.isDirectory()) {
        others.endFlag = others.endFlag + 1;
        addFileToZip(archive, Object.assign(others, {
          dirPath: filePath,
          root: path.join(root, file.name),
        }));
      } else if (isLegalFileType(file.name)) {
        const buf = fs.createReadStream(filePath);
        archive.append(buf, {
          name: path.join(root, file.name)
        });
      }
    });
    // pipe archive data to the file
    // console.log('close:', endFlag);
    others.finalize && (others.endFlag === 0) && archive.finalize();
  });
};
