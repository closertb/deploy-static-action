const fs = require('fs');
const core = require('@actions/core');

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  fs.readdir('dist', (err, files) => {
    console.log('s', files);
    files.forEach(file => {
      console.log('name:', file);
    });
    core.setOutput("time", time);
  });
  // Get the JSON webhook payload for the event that triggered the workflow
  // const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}