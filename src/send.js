const request = require('request');

module.exports = function sendData(url, formData) {
  request.post({ url, formData }, (error, response = {}, body) => {
    console.log('mesage', body);
    if (!error && response.statusCode < 300) {
      console.log('send file successfully');
      return;
    }
    console.error('send file failed');
  });
};
