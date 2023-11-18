const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const addFileToZip = require('./src/compose');

const target = 'zipFileName';
const home = path.join(__dirname, '/testDir');
const dist = 'target';
const pk = 'package.json';

const composeZip = target => new Promise((resolve, reject) => {
  try {
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });
    const zipPath = path.join(__dirname, `/${target}.zip`);
    const out = fs.createWriteStream(zipPath);
    out.on('close', () => {
      resolve('ok');
    });
    archive.pipe(out);
    // add file to zip
    addFileToZip(archive, {
      home,
      dirPath: pk,
      finalize: false,
    });
    addFileToZip(archive, {
      root: 'build',
      home,
      dirPath: dist,
      finalize: true,
    });
  } catch (err) {
    reject(err);
  }
});

// eslint-disable-next-line no-undef
test('throws invalid number', async () => {
  const res = await composeZip(target);
  console.log('res:', res);
  // eslint-disable-next-line no-undef
  expect(res).toEqual('ok');
});
