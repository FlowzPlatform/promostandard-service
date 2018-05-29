let axios = require('axios');
let config = require('./config');

exports.isAuthenticate = async function isAuthenticate(args) {
  return await userAuth(args.id,args.password);
}

function userAuth(username,password){
  return axios({
    method: 'GET',
    url: config.authroute,
    headers: {'username': username, 'password': password}
  })
  .then(function (response) {
    if(response.status == 200) {
      return response.data;
    }
  })
  .catch(function (error) {
    return error;
  });
}

exports.validationError = function validationError (errorCode,errorMessage) {
  return {
    ErrorMessage: {
      code: errorCode,
      description : errorMessage
    }
  }
}