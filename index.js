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
    const requestUrl = core.getInput('requestUrl');
    const dist = core.getInput('dist') || 'dist';
    const target = core.getInput('target') || 'dist';

    if (!name || !token) {
      console.error('name and token is nessary');
      return;
    }

    const formData = {
      type,
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
      console.log('start send zip files, params:', JSON.stringify(formData));
      formData.file = fs.createReadStream(zipPath);
      sendFile(requestUrl, formData);
    });
    archive.pipe(out);
    let home = '';
    if (type === 'server') {
      // 命令行执行的位置
      const targetPath = core.getInput('targetPath') || './';
      const commitSHA = github.context.sha;

      const messsage = await getCommitMessage(commitSHA);

      let cmd = 'npm run update';

      // commit 信息以fix:开头，表示需要安装包
      if (messsage.startsWith('fix:')) {
        cmd = 'npm run update:fix';
      }

      formData.cmd = cmd;
      formData.targetPath = targetPath;
      addFileToZip(archive, {
        dirPath: 'package.json',
        finalize: false,
      });
      addFileToZip(archive, {
        dirPath: 'pm2.json',
        finalize: false,
      });
      home = 'build';
    }
    // add file to zip
    addFileToZip(archive, {
      home,
      dirPath: dist,
      finalize: true,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
})();
