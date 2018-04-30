// Start Media Data Service
let axios = require('axios');
let config = require('./config');
let _ = require('lodash');
let commonFunction = require("./commonfunction");

let MediaContentServiceObject = {
  MediaContentService : {
    MediaContentServiceBinding : {
      getMediaContent: getMediaContentFunction,  
      getMediaDateModified : getMediaDateModifiedFunction,
    }
  }
}

function getMediaContentFunction (args, cb) {
  if(args.id!=null && args.password!=null){ 
    let param = '?sku='+args.productId;
    commonFunction.isAuthenticate(args).then(function(data){
      if(data.vid) {
        if ((args.mediaType == null) || (args.productId == null)) {
          return cb(commonFunction.validationError('125','The following field(s) are required [mediaType,productId]'));
        } 
        axios({
          method: 'GET',
          url: config.pdmurl + param,
          headers: {'vid': data.vid}
        })
        .then(function (response) {
          if(response.status === 200) {
            let data = response.data.hits.hits;
            let result = []; 
            let defaultImage = { 
              'productId': data[0]._source.sku, 
              'partId': '',
              'url': config.mediaUrl + data[0]._source.default_image,
              'ClassTypeArray' : {
                'ClassType' : {
                  'classTypeId' : '1006',
                  'classTypeName' : 'The primary image'
                }
              },
              'color': (data[0]._source.default_color) ? data[0]._source.default_color : '',
              'singlePart': 'FALSE'          
            }; 
            result.push(defaultImage);
      
            if(data[0]._source.images!= undefined) {
              _.forEach(data[0]._source.images, function(imagesvalue) {
                _.forEach(imagesvalue.images, function(imageval) {
                  let otherImage = {
                    'productId': imagesvalue.sku, 
                    'partId': '',
                    'url': config.mediaUrl + imageval.web_image,
                    'ClassTypeArray' : {
                      'ClassType' : {
                        'classTypeId' : '1005',
                        'classTypeName' : 'The shot is custom which does not fall into any specific type'
                      }
                    },
                    'color': (imageval.color) ? imageval.color : '',
                    'singlePart': 'FALSE'          
                  }; 
                  result.push(otherImage);
                });
              });
            }
      
            let MediaContentArrayList = {
              MediaContent: result
            }
            cb({
              MediaContentArray:MediaContentArrayList
            })
          }
          else {
            cb(commonFunction.validationError(response.status,response.data.error));
          }
        })
        .catch(function (error) {
          cb(commonFunction.validationError('500',error));
        });
      }
      else {
        cb(commonFunction.validationError('105',data.error));
      }  
    });
  }
  else {
    cb(commonFunction.validationError('110','Authentication Credentials required'));
  }
}

function getMediaDateModifiedFunction (args) {
  
}

module.exports = MediaContentServiceObject

// End Media Data Service 