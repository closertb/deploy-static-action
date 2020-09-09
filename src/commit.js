const exec = require('@actions/exec');

module.exports = async function getCommitMessage(sha) {
  let message = '';

  const options = {
    listeners: {
      stdout: (data) => {
        message += data.toString();
      }
    }
  };

  const args = [
    'rev-list',
    '--format=%B',
    '--max-count=1',
    sha
  ];

  await exec.exec('git', args, options);

  return message.trim();
};
