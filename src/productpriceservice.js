// Start Media Data Service
let axios = require('axios');
let config = require('./config');
let _ = require('lodash');
let commonFunction = require("./commonfunction");

let ProductPriceServiceObject = {
  PricingAndConfigurationService : {
    PricingAndConfigurationServiceBinding : {
      getAvailableLocations: getAvailableLocationsFunction,  
      getDecorationColors : getDecorationColorsFunction,
      getFobPoints : getFobPointsFunction,
      getAvailableCharges : getAvailableChargesFunction,
      getConfigurationAndPricing : getConfigurationAndPricingFunction,
    }
  }
}

function getAvailableLocationsFunction (args) {
  
}

function getDecorationColorsFunction (args) {
  
}


function getFobPointsFunction (args,cb) {
  if(args.id!=null && args.password!=null){ 
    commonFunction.isAuthenticate(args).then(function(data){ 
      if(data.vid) {
        let param = config.customQueryRoute+'?country='+args.localizationCountry+'&language='+args.localizationLanguage;
        if ((args.localizationCountry == null) || (args.localizationLanguage == null)) {
          return cb(commonFunction.validationError('120','The following field(s) are required [localizationCountry,localizationLanguage]'));
        }
        else if ("productId" in args) {
          body.query={"match_phrase":{"sku":args.productId}}
        }
        // console.log('param', config.pdmurl + param);
        //let vid ='054364d4-3a0b-436a-8144-04cbffb0587d'
        axios({
          method: 'POST',
          url: config.pdmurl + param,
          headers: {'vid': data.vid,'Content-Type':'application/json'},
          data : {"size":0,"aggs":{"fobID":{"terms":{"field":"shipping.fob_zip_code"},"aggs":{"fobCity":{"terms":{"field":"shipping.fob_city"},"aggs":{"fob_state_code":{"terms":{"field":"shipping.fob_state_code"},"aggs":{"fob_zip_code":{"terms":{"field":"shipping.fob_zip_code"},"aggs":{"fob_country_code":{"terms":{"field":"shipping.fob_country_code"},"aggs":{"currency":{"terms":{"field":"currency"}},"products":{"top_hits":{"_source":["sku"],"size":10000}}}}}}}}}}}}}}
        })
        .then(function (response) {
          if(response.status === 200) {
            let data = response.data.hits.hits;
            let result = []; 
            let ProductArray = []; 
            let fobId = '';
            let fobCity = '';
            let fobStateCode = '';
            let fobZipCode = '';
            let fobCountryCode = '';
            let ProductArrayList = '';
            let currency = '';
            let CurrencySupported = '';
            let FobPointArrayList = [];
            let ProductSkuArray = '';

            if(data!=undefined){
              _.forEach(response.data.aggregations, function(fobIDBuckets) {
                console.log(fobIDBuckets)
                if(fobIDBuckets){
                  _.forEach(fobIDBuckets.buckets, function(fobIDBucket) {
                      fobId = fobIDBucket.key
                      // console.log('fobIDBucket',fobId);
                    _.forEach(fobIDBucket.fobCity.buckets, function(fobCityBucket) {
                        fobCity = fobCityBucket.key;
                        // console.log('fobCityBucket',fobCity);
                      _.forEach(fobCityBucket.fob_state_code.buckets, function(fobStateCodeBucket) {
                          fobStateCode = fobStateCodeBucket.key;
                          // console.log('fobStateCodeBucket',fobStateCode);
                        _.forEach(fobStateCodeBucket.fob_zip_code.buckets, function(fobZipCodeBucket) { 
                            fobZipCode = fobZipCodeBucket.key;
                            // console.log('fobZipCode',fobZipCode);
                          _.forEach(fobZipCodeBucket.fob_country_code.buckets, function(fobCountryCodeBucket) {  
                              fobCountryCode = fobCountryCodeBucket.key;
                            // console.log('fobCountryCode',fobCountryCode);
                              let ProductSkuArray = _.map(fobCountryCodeBucket.products.hits.hits, function(o) { return {'productId': o._source.sku} }); 
                              // console.log('ProductSkuArrayList',ProductSkuArray) 
                              ProductArrayList = {
                                'Product' : ProductSkuArray
                              }
                            _.forEach(fobCountryCodeBucket.currency.buckets, function(currencyBucket) {  
                               currency = currencyBucket.key;
                               CurrencySupported = {
                                'CurrencySupported' : {
                                  'currency' : currency
                                }
                              }
                              // console.log('CurrencySupported',CurrencySupported);
                            });
                          })
                        })
                      })
                    });
                    FobPointArrayList.push({
                        'fobId' : fobId,
                        'fobCity': fobCity,
                        'fobState': fobStateCode,
                        'fobPostalCode': fobZipCode,
                        'fobCountry': fobCountryCode,
                        'CurrencySupportedArray': CurrencySupported,
                        'ProductArray' : ProductArrayList
                      });
                    // console.log('FobPointArrayList',FobPointArrayList);
                  });
                } 
              });
              let FobPointArray = {
                'FobPoint': FobPointArrayList
              }
              cb({
                FobPointArray:FobPointArray
              }) 
            }
            else {
              cb(commonFunction.validationError('999','General Error – Contact the System Service Provider Details'));
            }
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

function getAvailableChargesFunction (args) {
  
}

function getConfigurationAndPricingFunction (args,cb) {
  if(args.id!=null && args.password!=null){ 
    commonFunction.isAuthenticate(args).then(function(data){
      console.log('VID',data.vid) 
      
      if(data.vid) {
        let param = config.customQueryRoute+'?country='+args.localizationCountry+'&language='+args.localizationLanguage;
        // console.log('URL',config.pdmurl + param)
        let vid = '054364d4-3a0b-436a-8144-04cbffb0587d';
        
        if ((args.localizationCountry == null)) {
          return cb(commonFunction.validationError('120','The following field(s) are required localizationCountry'));
        }
        else if(args.localizationLanguage == null){
          return cb(commonFunction.validationError('120','The following field(s) are required: localizationLanguage'));
        }
        else if(args.fobId == null){
          return cb(commonFunction.validationError('120','The following field(s) are required: fobId'));
        }
        else if(args.configurationType == null){
          return cb(commonFunction.validationError('120','The following field(s) are required: configurationType'));
        }
        else if(args.productId == null){
          return cb(commonFunction.validationError('120','The following field(s) are required: productId'));
        }
        else if(args.currency == null){
          return cb(commonFunction.validationError('120','The following field(s) are required: currency'));
        }
        else if(args.priceType == null){
          return cb(commonFunction.validationError('120','The following field(s) are required: priceType'));
        }
        else
        { 
          axios({
            method: 'POST',
            url: config.pdmurl + param,
            headers: {'vid': vid,'Content-Type':'application/json'},
            data : {"query":{"bool":{"must":[{"match_phrase":{"shipping.fob_zip_code":args.fobId}},{"match_phrase":{"sku":args.productId}},{"match_phrase":{"pricing.type":args.configurationType}},{"match_phrase":{"currency":args.currency}}]}},"_source":["pricing","description"]}
          })
          .then(function (response) {
            if(response.status == 200) {
              let Partresult = '';
              let PriceRange = '';
              let PartArrayResult = '';
              let result = '';
              let currency = '';
              let ProductSku ='';

              let data = response.data.hits.hits[0]._source;
              let description = data.description;
              if(data.pricing!=undefined){
                _.forEach(data.pricing, function(pricingData) {
                  let PriceUnit = pricingData.price_unit;
                  currency = pricingData.currency;
                  ProductSku = pricingData.sku;
                  PriceRange = _.map(pricingData.price_range, function(p) {
                    return { 
                      'PartPrice' : {
                        'minQuantity':p.qty.gte,
                        'price':p.price,
                        'discountCode':p.code,
                        'priceUom': PriceUnit, 
                        'priceEffectiveDate' :'2018-01-01T00:00:00', // Right now not getting date from elaticsearch api
                        'priceExpiryDate': '2018-01-01T00:00:00' // Right now not getting date from elaticsearch api
                      }
                    }
                  });

                  PartArrayResult =  {
                    'part' : { 
                      "partId": pricingData.sku, 
                      'partDescription': description,
                      'PartPriceArray': PriceRange
                    }
                  }
                });

                let result = {
                  'PartArray':PartArrayResult,
                  'LocationArray':'',
                  'productId': ProductSku,
                  'currency': currency,
                  'fobPostalCode':''
                }
                cb({
                  'Configuration':result
                })
              }
              else {
                cb(commonFunction.validationError('999','General Error – Contact the System Service Provider Details'));
              }
            }
            else{
              cb(commonFunction.validationError(response.status,response.data.error));
            }
          })
          .catch(function (error) {
            cb(commonFunction.validationError('500',error));
          });
        }
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

/*
function getFobPointsFunction (args,cb) {
  let param = '?source=shipping,currency&country='+args.localizationCountry+'&language='+args.localizationLanguage;
  if ((args.localizationCountry == null) || (args.localizationLanguage == null)) {
    return cb({
      ErrorMessage: {
        code: '120',
        description : 'The following field(s) are required [localizationCountry,localizationLanguage]'
      }
    });
  }
  else if ("productId" in args) {
    param = param + "&sku="+ args.productId;
  }
  
  console.log('param', config.pdmurl + param);
  axios({
    method: 'GET',
    url: config.pdmurl + param,
    headers: {'vid': config.vid}
  })
  .then(function (response) {
    if(response.status === 200) {
      let data = response.data.hits.hits;
      let result = []; 
      let ProductArray = []; 
      // let shippingData =  data[0]._source;
      // console.log('data', shippingData);
      if(data!=undefined){
        //console.log('data',data);
        let shippingObj = [];
        let CurrencySupported = [];
        _.map(data, function(o) {
          CurrencySupported['currency']= o._source.currency;
          _.forEach(o._source.shipping, function(value) { 
            shippingObj.push(value);
          });
        });

        let groupByFOBPoint = groupBy(shippingObj, function(item) {
          return [item.fob_zip_code, item.fob_city, item.fob_state_code, item.free_on_board, item.fob_country_code];
        });

        _.forEach(groupByFOBPoint, function(productIds, fobInfo) {
            

          _.forEach(productIds, function(productId){
              let ProductObj = {
                'Product' : {
                  'productId': productId
                } 
              };
              ProductArray.push(ProductObj);  
            });  
            console.log('KEY', key);
            console.log('Value', productIds);
        });

        result['ProductArray'] = ProductArray;

        //console.log('CurrencySupported',CurrencySupported);
        console.log('result',result);
      }
     
      

      let FobPointArrayList = {
        FobPoint: result
      }
      cb({
        FobPointArray:FobPointArrayList
      }) 
    }
    else {
      
    }
  })
  .catch(function (error) {

  });
  
}
*/

function groupBy( array , f ){
  var groups = {};
  array.forEach( function( o )
  {
    var group = JSON.stringify( f(o) );
    groups[group] = groups[group] || [];
    groups[group].push( o.sku );  
  });
  return groups;
}

module.exports = ProductPriceServiceObject

// End Media Data Service 