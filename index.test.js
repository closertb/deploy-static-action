const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const addFileToZip = require('./src/compose');

const target = 'zipFileName';
const dist = 'testDir';

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
    addFileToZip(archive, dist);
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
