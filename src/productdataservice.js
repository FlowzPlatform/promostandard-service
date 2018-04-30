// Start ProductData Service
let axios = require('axios');
let config = require('./config');
let _ = require('lodash');
let commonFunction = require("./commonfunction");


let ProductDataServiceObject = {
  ProductDataService : {
    ProductDataServiceBinding : {
      getProduct: getProductFunction,  
      getProductDateModified : getProductDateModifiedFunction,
      getProductCloseOut : getProductCloseOutFunction,
      getProductSellable : getProductSellableFunction
    }
  }
}

function getProductFunction (args,cb) {
  if(args.id!=null && args.password!=null){ 
    commonFunction.isAuthenticate(args).then(function(data){ 
      if(data.vid) {
        if ((args.localizationCountry == null) || (args.localizationLanguage == null) || (args.productId == null)) {
          return cb(commonFunction.validationError('125','The following field(s) are required [localizationCountry,localizationLanguage,productId]'));
        }
        axios({
          method: 'GET',
          url: config.pdmurl + '?sku='+args.productId,
          headers: {'vid': data.vid}
        })
        .then(function (response) {
          if(response.status === 200) {
            let data = response.data.hits.hits[0]._source;
            // console.log('response',data);

            let featureResult = _.map(data.features, function(f) { return { "pointType": f.key, 'pointCopy': f.value}; });
            let searchKeywords = _.map(data.search_keyword, function(k) { return {"keyword" : k }});
            let categoryArray = _.map(data.categories, function(c) { return {"category" : c, "subCategory":''}});
            let colorArray =  _.map(data.attributes.colors, function(ac) { return { "colorName": ac}; });  
            let productDimension = _.map(data.shipping, function(pd) { 
              return {
                'dimensionUom':pd.product_size_unit,
                'depth':pd.product_length,
                'height':pd.product_height,
                'width':pd.product_width,
                'weightUom':pd.product_weight_unit,
                'weight':pd.product_weight
              }
            })
            let productPackagingArray = { 
              'ProductPackage' : {
                'defulat':true,
                'packageType':data.packaging_type,
                'quantity' :'',
                'dimensionUom' :'',
                'depth':'',
                'height':'',
                'width':'',
                'weightUom':'',
                'weight':''
              }  
            };
            let shippingPackageArray = _.map(data.shipping, function(sd) { 
              return {
                'packageType':'',
                'quantity':sd.shipping_qty_per_carton,
                'dimensionUom':sd.carton_size_unit,
                'depth':sd.carton_length,
                'height':sd.carton_height,
                'width':sd.carton_width,
                'weightUom':sd.carton_weight_unit,
                'weight':sd.carton_weight
              }
            })

            let productPartArray = {
              'ProductPart': {
                'partId' : data.sku,
                'description': data.description,
                'countryOfOrigin' : '',
                'ColorArray' : {'Color': colorArray},
                'primaryMaterial' : '',
                'Dimension' : productDimension,
                'leadTime':'',
                'isRushService':'',
                'ProductPackagingArray': productPackagingArray,
                'ShippingPackageArray' : shippingPackageArray  
              }
            }

            let result = { 
              "productId": data.sku, 
              'productName': data.product_name,
              'description': data.description,
              'ProductMarketingPointArray' : {'ProductMarketingPoint':featureResult},
              'ProductKeywordArray' : {'ProductKeyword':searchKeywords},
              'productBrand':data.linename,
              'export': true,
              'ProductCategoryArray': {'ProductCategory':categoryArray},
              'RelatedProductArray' : '',
              'ProductPartArray' :productPartArray,
              'lastChangeDate':'',
              'creationDate':'',
              'endDate':data.valid_up_to,
              'effectiveDate':'',
              'isCaution':'',
              'isCloseout':false,
              'lineName':data.linename
            }; 
            // console.log('result',result);
            cb({
              'Product':result
            })
            //console.log('ProductResponse',ProductResponse);
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
        console.log('data',data);
        cb(commonFunction.validationError('105',data.error));
      }  
    });
  }
  else {
    cb(commonFunction.validationError('110','Authentication Credentials required'));
  }
}

function getProductDateModifiedFunction (args) {

}
function getProductCloseOutFunction (args) {

}

function getProductSellableFunction(args, cb) {
  if(args.id!=null && args.password!=null){ 
    let param = '?source=sku&$limit=';
    if ((args.isSellable == null) || (args.isSellable == '0')) {
      return cb(commonFunction.validationError('125','isSellable argument not Supported: false or 0 or blank'));
    }
    else if ("productId" in args) {
      // console.log('productId',productId)
      param = "?sku="+ args.productId + '&$limit=';
    }
    commonFunction.isAuthenticate(args).then(function(data){
        console.log('data',data);
        if(data.vid) {
          asyncProductsCount(data.vid,param).then(function(response){
            let productCount = response.hits.total;
              axios({
                method: 'GET',
                url: config.pdmurl + param + productCount,
                headers: {'vid': data.vid}
              })
              .then(function (response) {
                if(response.status == 200) {
                //  console.log('response', response.data);
                  let data = response.data.hits.hits;
                  let result = _.map(data, function(o) { return { "productId": o._source.sku, 'partId': ''}; });
                  let ProductSellableArrayList = {
                    ProductSellable: result
                  }
                  cb({
                    ProductSellableArray:ProductSellableArrayList
                  })
                }
                else {
                  cb(commonFunction.validationError(response.status,response.data.error));
                }
              })
              .catch(function (error) {
                cb(commonFunction.validationError('500',error));
              });
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

async function asyncProductsCount(vid,param){
  return await getProductsCount(vid,param);
}

function getProductsCount(vid,param){
  let limit = 1
  return axios({
    method: 'GET',
    url: config.pdmurl + param + limit,
    headers: {'vid': vid}
  })
  .then(function (response) {
    if(response.status == 200) {
      return response.data
    }
  })
  .catch(function (error) {
    return error;
  });
}

module.exports = ProductDataServiceObject

// End ProductData Service 

