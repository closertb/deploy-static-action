const request = require('request');

module.exports = {
  sendFile(url, formData) {
    return request.post({ url, formData }, (error, response = {}, body) => {
      console.log('mesage', body);
      if (!error && response.statusCode < 300) {
        console.log('send file successfully');
        return;
      }
      console.error('send file failed');
    });
  },
  sendData(url, form) {
    return request.post({ url, form }, (error, response = {}, body) => {
      console.log('mesage', body);
      if (!error && response.statusCode < 300) {
        console.log('send file successfully');
        return;
      }
      console.error('send file failed');
    });
  }
};
