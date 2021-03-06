const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const core = require('@actions/core');
const github = require('@actions/github');
const getCommitMessage = require('./src/commit');
const { sendData, sendFile } = require('./src/send');
const addFileToZip = require('./src/compose');

(async () => {
  try {
    const type = core.getInput('type') || 'static'; //  || 'dom'
    const name = core.getInput('name'); //  || 'dom'
    const token = core.getInput('token'); //  || 'dom'
    const targetPath = core.getInput('targetPath'); //  || 'dom'
    const requestUrl = core.getInput('requestUrl');
    const dist = core.getInput('dist') || 'dist';
    const target = core.getInput('target') || 'dist';

    if (!name || !token) {
      console.error('name and token is nessary');
      return;
    }

    if (type === 'server') {
      const commitSHA = github.context.sha;

      const messsage = await getCommitMessage(commitSHA);

      let cmd = 'npm run update';

      if (messsage.includes('fix:')) {
        cmd = 'npm run update:fix';
      }

      sendData(requestUrl, {
        cmd,
        targetPath
      });
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
      sendFile(requestUrl, formData);
    });
    archive.pipe(out);
    // add file to zip
    addFileToZip(archive, dist);
  } catch (error) {
    core.setFailed(error.message);
  }
})();
