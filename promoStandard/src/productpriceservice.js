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

function getAvailableLocationsFunction (args,cb) {
  if(args.id!=null && args.password!=null){ 
    commonFunction.isAuthenticate(args).then(function(data){ 
      if(data.vid) {
        console.log('------> vid', data.vid)
        let body = {"_source":["sku"],"size":0,"aggs":{"imprint_data":{"nested":{"path" :"imprint_data"},"aggs":{"position":{"terms":{"field":"imprint_data.imprint_position.raw"}}}}}};
        
        let param = config.customQueryRoute+'?country='+args.localizationCountry+'&language='+args.localizationLanguage;
        
        if ((args.localizationCountry == null) || (args.localizationLanguage == null) || (args.productId == null)) {
          return cb(commonFunction.validationError('120','The following field(s) are required [productId,localizationCountry,localizationLanguage]'));
        }
        else if ("productId" in args) {
          body.query={"match_phrase":{"sku":args.productId}}
        }
        axios({
          method: 'POST',
          url: config.pdmurl + param,
          headers: {'vid': data.vid,'Content-Type':'application/json'},
          data : body
        })
        .then(function (response) {
          if(response.status === 200) {
            // console.log(response.data.aggregations)
            let data = response.data.aggregations;
            
            let getAvailableLocations = data.imprint_data.position.buckets[0].key;
            let getAvailableLocationsArray = getAvailableLocations.split('|')
            
            // console.log("getAvailableLocationsArray",getAvailableLocationsArray)
            // var obj = _.extend({ 'location': 0 }, getAvailableLocations.split('|'));
            
            let locationList = [];
            let result = [];

            if(getAvailableLocationsArray.length > 0)
            {
              for (var i = 0; i < getAvailableLocationsArray.length; i++){ 
                locationList.push({'location':getAvailableLocationsArray[i]});
              }
  
              // let locationList = [{"location":"CSK"},{"location":"ff662"}];
              console.log( config.serviceUrl+'/promoStandardLocation')
              axios({
                method : 'POST',
                url : config.serviceUrl+'/promoStandardLocation',
                data: locationList
              })
              .then(function (response) {
                  let locationData = [];
  
                  for (var i = 0; i < response.data.length; i++){ 
                    let locationList = {};
                      
                    locationList = { 
                      'locationName':response.data[i].location,
                      'locationId':response.data[i].location_id
                    }
                    locationData.push(locationList)
                  }
                  
                  let result = {'AvailableLocation' :locationData}
                  cb({
                    'AvailableLocationArray':result
                  })
                })
                .catch(function (error) {
                  console.log("error",error)
                });
            }
            else{
              cb({
                'AvailableLocationArray':result
              })
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

async function getDecorationMethods(args,cb,vid,param) {
  var finalDecorationMethodArray = null;

  if ("decorationId" in args) {
    await axios({
      method : 'GET',
      url : config.serviceUrl+'/promoStandardDecorationMethod?method_id='+args.decorationId
    })
    .then(async function (response) {
        if(response.data.total>0)
        {
          let availableDecorationMethods =  await checkDecorationIdExistInProduct(args,cb,vid,param);
          // console.log('availableDecorationMethods',availableDecorationMethods.DecorationMethod)

          let getExistingMethod = _.find(availableDecorationMethods.DecorationMethod, { 'decorationId': args.decorationId });

          if(typeof getExistingMethod === typeof undefined)
          {
            cb(commonFunction.validationError('500','Invalid decoratioId'));
          }
          
          // console.log('getExistingMethod',typeof getExistingMethod)

          
          let productData = response.data.data;

          let methodData = [];

          for (var i = 0; i < productData.length; i++){ 
            methodData.push({'decorationName':productData[i].name,'decorationId':productData[i].method_id});
          }
          return finalDecorationMethodArray = {'DecorationMethod':methodData};
        }
        else{
          cb(commonFunction.validationError('500','Invalid decoratioId')); 
        }
    })
    .catch(function (error) {
      cb(commonFunction.validationError('500',error));
    });
  }
  else{
    return finalDecorationMethodArray = await checkDecorationIdExistInProduct(args,cb,vid,param)
  }
  return finalDecorationMethodArray;
}

async function checkDecorationIdExistInProduct(args,cb,vid,param) {
  var finalDecorationMethodArray = '';

  let decorationMethodQuery = {"_source":["sku"],"size":0,"aggs":{"imprint_data":{"nested":{"path":"imprint_data"},"aggs":{"position":{"terms":{"field":"imprint_data.imprint_method.raw"}}}}}}

    if ("productId" in args) {
      decorationMethodQuery.query={"match_phrase":{"sku":args.productId}}
    }
    await axios({
      method: 'POST',
      url: config.pdmurl + param,
      headers: {'vid': vid,'Content-Type':'application/json'},
      data : decorationMethodQuery
    })
    .then(async function (response) {
      if(response.status === 200) {
        let data = response.data.aggregations;
        let getMethodsArray = data.imprint_data.position.buckets;
        let methodList = [];
        let methodData = [];
        
        if(getMethodsArray.length > 0)
        {
          for (var i = 0; i < getMethodsArray.length; i++){ 
            methodList.push({'name':getMethodsArray[i].key});
          }
          // methodList = [{"name":"2_side"},{"name":"1_side"}];
          
          await axios({
            method : 'POST',
            url : config.serviceUrl+'/promoStandardDecorationMethod',
            data: methodList
          })
          .then(function (response) {
            for (var i = 0; i < response.data.length; i++){ 
              let methodList = {};
                
              methodList = { 
                'decorationId':response.data[i].method_id,
                'decorationName':response.data[i].name
              }
              methodData.push(methodList)
            }
            return finalDecorationMethodArray = {'DecorationMethod':methodData};          
          })
          .catch(function (error) {
            cb(commonFunction.validationError('500',error));
          });
        }
        else{
          return finalDecorationMethodArray = {'DecorationMethod':methodData};                    
        }
      }
    })
    .catch(function (error) {
      cb(commonFunction.validationError('500',error));
    });
    return finalDecorationMethodArray;
}

function getDecorationColorsFunction (args,cb) {
  if(args.id!=null && args.password!=null){ 
    commonFunction.isAuthenticate(args).then(function(data){ 
      if(data.vid) {
        let vid = data.vid;
        let body = {"_source":["sku","imprint_data.full_color","imprint_data.is_pms_color_allow"],"size": 1,"aggs":{"imprint_data":{"terms":{"field":"attributes.colors"}}}};
        
        let param = config.customQueryRoute+'?country='+args.localizationCountry+'&language='+args.localizationLanguage;
        
        if ((args.localizationCountry == null) || (args.localizationLanguage == null) || (args.locationId == null) || (args.productId == null)) {
          return cb(commonFunction.validationError('120','The following field(s) are required [localizationCountry,localizationLanguage,locationId,productId]'));
        }
        else if ("productId" in args) {
          body.query={"match_phrase":{"sku":args.productId}}
        }

        axios({
          method: 'POST',
          url: config.pdmurl + param,
          headers: {'vid': data.vid,'Content-Type':'application/json'},
          data : body
        })
        .then(function (response) {
          // console.log("data response------------------------",response.data)
          
          if(response.status === 200) {
            let productData = response.data.hits.hits[0]._source;
            let data = response.data.aggregations;

            let isPMSColor = productData.imprint_data[0].is_pms_color_allow;
            let isFullColor = productData.imprint_data[0].full_color;

            // console.log("data------------------------",data)

            let getAvailableColorsArray = data.imprint_data.buckets;
            // console.log("getAvailableColorsArray",getAvailableColorsArray)
            
            let decorationMethods = '';
            let finalDecorationMethodArray= '';            
            axios({
              method : 'GET',
              url : config.serviceUrl+'/promoStandardLocation?location_id='+args.locationId
            })
            .then(async function (response) {
                // console.log("promoStandardLocation------------------------",response.data)

                if(response.data.total>0)
                {
                  //decorationId
                  let finalDecorationMethodArray = await getDecorationMethods(args,cb,vid,param)
                  
                  // console.log("finalDecorationMethodArray-------",finalDecorationMethodArray)
                  //END - decorationId
                  // let colorList = [{"name":"Red"},{"name":"White"}];
                  let colorList = [];

                  for (var i = 0; i < getAvailableColorsArray.length; i++){ 
                    colorList.push({'name':getAvailableColorsArray[i].key});
                  }

                  // console.log("colorList",colorList)

                  axios({
                    method : 'POST',
                    url : config.serviceUrl+'/promoStandardColors',
                    data: colorList
                  })
                  .then(function (response) {
                    // console.log("colorList------------------------",response.data)

                    let colorData = [];

                    for (var i = 0; i < response.data.length; i++){ 
                      let colorList = {};
                        
                      colorList = { 
                        'colorId':response.data[i].color_id,
                        'colorName':response.data[i].name
                      }
                      colorData.push(colorList)
                    }
                    // console.log("colorData------------------------",colorData)
                    let finalColorArray = {'Color':colorData};


                    let result = {'ColorArray' :finalColorArray, productId:args.productId,locationId:args.locationId, 'DecorationMethodArray':finalDecorationMethodArray,'pmsMatch':isPMSColor, 'fullColor':isFullColor}
                    cb({
                      'DecorationColors':result
                    })
                  })
                  .catch(function (error) {
                    cb(commonFunction.validationError('500',error));
                  });

                }
                else{
                  cb(commonFunction.validationError('500','Invalid location ID'));
                }
              })
              .catch(function (error) {
                console.log("error",error)
              });
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


function getFobPointsFunction (args,cb) {
  if(args.id!=null && args.password!=null){ 
    commonFunction.isAuthenticate(args).then(function(data){ 
      if(data.vid) {
        let body = {"size":0,"aggs":{"fobID":{"terms":{"field":"shipping.fob_zip_code"},"aggs":{"fobCity":{"terms":{"field":"shipping.fob_city"},"aggs":{"fob_state_code":{"terms":{"field":"shipping.fob_state_code"},"aggs":{"fob_zip_code":{"terms":{"field":"shipping.fob_zip_code"},"aggs":{"fob_country_code":{"terms":{"field":"shipping.fob_country_code"},"aggs":{"currency":{"terms":{"field":"currency"}},"products":{"top_hits":{"_source":["sku"],"size":10000}}}}}}}}}}}}}};
        let param = config.customQueryRoute+'?country='+args.localizationCountry+'&language='+args.localizationLanguage;
        if ((args.localizationCountry == null) || (args.localizationLanguage == null)) {
          return cb(commonFunction.validationError('120','The following field(s) are required [localizationCountry,localizationLanguage]'));
        }
        else if ("productId" in args) {
          body.query={"match_phrase":{"sku":args.productId}}
          // param += "&sku="+ args.productId;
        }
        //let vid ='054364d4-3a0b-436a-8144-04cbffb0587d'
        axios({
          method: 'POST',
          url: config.pdmurl + param,
          headers: {'vid': data.vid,'Content-Type':'application/json'},
          data : body
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
                        console.log('fobCityBucket',fobCity);
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
  
function getAvailableChargesFunction (args,cb) {
  if(args.id!=null && args.password!=null){ 
    commonFunction.isAuthenticate(args).then(function(data){ 
      console.log("data.vid",data.vid)
      if(data.vid) {
        // let body = {"_source":["sku"],"size":0,"aggs":{"imprint_data":{"nested":{"path" :"imprint_data"},"aggs":{"position":{"terms":{"field":"imprint_data.imprint_position.raw"}}}}}};
        // let body = {"query":{"match":{"sku":"68420"}},"_source":"imprint_data"};
        let body = {};
        let param = config.customQueryRoute+'?country='+args.localizationCountry+'&language='+args.localizationLanguage;
        
        if ((args.localizationCountry == null) || (args.localizationLanguage == null)) {
          return cb(commonFunction.validationError('120','The following field(s) are required [localizationCountry,localizationLanguage]'));
        }
        if ("productId" in args) {
          body.query = {"match_phrase":{"sku":args.productId}};
          // param += "&sku="+ args.productId;
        }
        //let vid ='054364d4-3a0b-436a-8144-04cbffb0587d'
        axios({
          method: 'POST',
          url: config.pdmurl + param,
          headers: {'vid': data.vid,'Content-Type':'application/json'},
          data : body
        })
        .then(function (resp) {
          if(resp.status === 200) {
            // console.log('response:: ', JSON.stringify(response.data));
            // let data = response.data.aggregations;
            // console.log("data",data.imprint_data.position)
            let chargeList = [{"charge":"Setup"},{"charge":"Run"}];

            axios({
              method : 'POST',
              url : config.serviceUrl+'/promoStandardCharges',
              data: chargeList
            })
            .then(function (response) {
                // console.log("resp.data.hits.hits------------------------",resp.data.hits.hits)
                let chargeData = [];
                if ("productId" in args) {
                  let charge = [];
                  for (let item of resp.data.hits.hits[0]._source.imprint_data) {
                    if (item.hasOwnProperty('setup_charge')) {
                      charge.push('Setup');
                    }
                    if (item.hasOwnProperty('run_charge')) {
                      charge.push('Run');
                    }
                  }
                  charge = _.uniq(charge);

                  for (let result of charge) {
                    let finx = _.findIndex(response.data, {charge: result});
                    chargeData.push({
                      'chargeName':response.data[finx].charge,
                      'chargeId':response.data[finx].charge_id,
                      'chargeDescription':response.data[finx].chargeDescription,
                      'chargeType':response.data[finx].chargeType
                    }) 
                  }

                } else {
                  for (let i = 0; i < response.data.length; i++){ 
                    let chargeList = {};
                      
                    chargeList = { 
                      'chargeName':response.data[i].charge,
                      'chargeId':response.data[i].charge_id,
                      'chargeDescription':response.data[i].chargeDescription,
                      'chargeType':response.data[i].chargeType
                    }
                    chargeData.push(chargeList)
                  }
                }
                // console.log("chargeData------------------------",chargeData)
                
                let result = {'AvailableCharge' :chargeData}
                cb({
                  'AvailableChargeArray':result
                })
              })
              .catch(function (error) {
                console.log("error",error)
              });
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

function getConfigurationAndPricingFunction (args,cb) {
  if(args.id!=null && args.password!=null){ 
    commonFunction.isAuthenticate(args).then(function(data){
      console.log('VID',data.vid) 
      
      if(data.vid) {
        let param = config.customQueryRoute+'?country='+args.localizationCountry+'&language='+args.localizationLanguage;
        
        if(args.configurationType == "Decorated")
        {
          args.configurationType = "Decorative";
        }
        let vid = data.vid;//'054364d4-3a0b-436a-8144-04cbffb0587d';
        
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
            data : {"query":{"bool":{"must":[{"match_phrase":{"shipping.fob_zip_code":args.fobId}},{"match_phrase":{"sku":args.productId}},{"match_phrase":{"pricing.type":args.configurationType}},{"match_phrase":{"currency":args.currency}}]}},"_source":["pricing","description","valid_up_to", "shipping", "imprint_data"]}
          })
          .then(async function (response) {
            if(response.status == 200) {
              let Partresult = '';
              let PriceRange = '';
              let PartArrayResult = '';
              let result = '';
              let currency = '';
              let FobArray = '';
              let ProductSku ='';
              let LocationArray = '';

              let data = response.data.hits.hits[0]._source;
              let description = data.description;
              // console.log('data',data)
              if(data.pricing!=undefined){
                _.forEach(data.pricing, function(pricingData) {
                  let PriceUnit = pricingData.price_unit;
                  currency = pricingData.currency;
                  ProductSku = pricingData.sku;
                  PriceRange = _.map(pricingData.price_range, function(p) {
                    return { 
                        'minQuantity':p.qty.gte,
                        'price':p.price,
                        'discountCode':p.code,
                        'priceUom': PriceUnit, 
                        'priceEffectiveDate' :'2018-01-01T00:00:00', // Right now not getting date from elaticsearch api
                        // 'priceExpiryDate': '2018-01-01T00:00:00' //data.valid_up_to // Right now not getting date from elaticsearch api
                        'priceExpiryDate': data.valid_up_to
                      }
                  });
                });
                PartArrayResult =  {
                  'part' : { 
                    "partId": ProductSku, 
                    'partDescription': description,
                    'PartPriceArray': {'PartPrice' :PriceRange}
                  }
                }

                if (data.shipping != undefined) {
                  FobArray = [];
                  FobArray = _.map(data.shipping, function(f) {
                    return {
                      fobId: f.fob_zip_code,
                      fobPostalCode: f.free_on_board
                    }
                  })
                }

                if (data.imprint_data != undefined) {
                  LocationArray = []
                  for (let item of data.imprint_data) {
                    let position = item.imprint_position;
                    position = position.split('|');

                    for(let pos of position) {
                      await axios({
                        method : 'GET',
                        url : config.serviceUrl+'/promoStandardLocation' + '?location=' + pos
                      }).then(async res => {
                        if (res.data.data.length > 0) {

                          let DecorationArrayResult = [];
                          let ChargeArrayResult = [];
                          
                          if (item.hasOwnProperty('setup_charge')) {
                            await axios({
                              method: 'GET',
                              url: config.serviceUrl+'/promoStandardCharges' + '?charge=Setup' 
                            }).then(async respp => {
                              // console.log('item::==>', item);
                              let charge = ''
                              let dcode = ''
                              let str = [];
                              if (item.setup_charge != '') {
                                charge = item.setup_charge;
                                str = charge.split('(');
                                charge = str[0];
                                dcode = str[1].replace(')', '');
                              }
                              if (respp.data.data.length > 0) {

                                ChargeArrayResult.push({
                                  chargeId: respp.data.data[0].charge_id,
                                  chargeName: respp.data.data[0].charge,
                                  chargeType: respp.data.data[0].charge,
                                  chargeDescription: respp.data.data[0].charge,
                                  ChargePriceArray: [{
                                    xMinQty: '',
                                    xUom: '',
                                    yMinQty: '',
                                    yUom: '',
                                    price: charge,
                                    discountCode: dcode
                                  }]
                                })
                              } else {
                                await axios({
                                  method: 'POST',
                                  url: config.serviceUrl+'/promoStandardCharges',
                                  data: [{ name: 'Setup' }]
                                }).then(rpp => {
                                  ChargeArrayResult.push({
                                    chargeId: rpp.data[0].charge_id,
                                    chargeName: rpp.data[0].charge,
                                    chargeType: rpp.data[0].charge,
                                    chargeDescription: rpp.data[0].charge,
                                    ChargePriceArray: [{
                                      xMinQty: '',
                                      xUom: '',
                                      yMinQty: '',
                                      yUom: '',
                                      price: charge,
                                      discountCode: dcode
                                    }]
                                  })
                                })
                              }
                            })
                          }

                          if (item.hasOwnProperty('run_charge')) {
                            await axios({
                              method: 'GET',
                              url: config.serviceUrl+'/promoStandardCharges' + '?charge=Run' 
                            }).then(async respp => {
                              
                              let charge = item.run_charge
                              let dcode = ''
                              let str = charge.split('(');
                              charge = str[0];
                              dcode = str[1].replace(')', '');

                              if (respp.data.data.length > 0) {

                                ChargeArrayResult.push({
                                  chargeId: respp.data.data[0].charge_id,
                                  chargeName: respp.data.data[0].charge,
                                  chargeType: respp.data.data[0].charge,
                                  chargeDescription: respp.data.data[0].charge,
                                  ChargePriceArray: [{
                                    xMinQty: '',
                                    xUom: '',
                                    yMinQty: '',
                                    yUom: '',
                                    price: charge,
                                    discountCode: dcode
                                  }]
                                })
                              } else {
                                await axios({
                                  method: 'POST',
                                  url: config.serviceUrl+'/promoStandardCharges',
                                  data: [{ name: 'Run' }]
                                }).then(rpp => {
                                  ChargeArrayResult.push({
                                    chargeId: rpp.data[0].charge_id,
                                    chargeName: rpp.data[0].charge,
                                    chargeType: rpp.data[0].charge,
                                    chargeDescription: rpp.data[0].charge,
                                    ChargePriceArray: [{
                                      xMinQty: '',
                                      xUom: '',
                                      yMinQty: '',
                                      yUom: '',
                                      price: charge,
                                      discountCode: dcode
                                    }]
                                  })
                                })
                              }
                            })
                          }

                          await axios({
                            method: 'GET',
                            url: config.serviceUrl+'/promoStandardDecorationMethod' + '?name=' + item.imprint_method
                          }).then(async respp => {
                            if (respp.data.data.length > 0) {
                              DecorationArrayResult.push({
                                decorationId: respp.data.data[0].method_id,
                                decorationName: respp.data.data[0].name,
                                decorationGeometry: 'Other',
                                ChargeArray: ChargeArrayResult
                              })
                            } else {
                              await axios({
                                method: 'POST',
                                url: config.serviceUrl+'/promoStandardDecorationMethod',
                                data: [{ name: item.imprint_method }]
                              }).then(rpp => {
                                DecorationArrayResult.push({
                                  decorationId: rpp.data[0].method_id,
                                  decorationName: rpp.data[0].name,
                                  decorationGeometry: 'Other',
                                  ChargeArray: ChargeArrayResult
                                })
                              })
                            }
                          })

                          LocationArray.push({
                            locationId : res.data.data[0].location_id,
                            locationName : res.data.data[0].location,
                            DecorationArray: DecorationArrayResult,
                            maxDecoration: item.max_location_allowed
                            // minDecoration: 1,
                            // decorationsIncluded: 1,
                            // defaultLocation: true
                          });
                        } else {
                          await axios({
                            method: 'POST',
                            url: config.serviceUrl+'/promoStandardLocation',
                            data: [{location: pos}]
                          }).then(resp => {
                            // console.log('POST ::', resp.data[0].location_id)
                            LocationArray.push({
                              locationId: resp.data[0].location_id, 
                              locationName: pos
                            });
                          })
                        }
                      })
                    }
                  }
                  console.log('LocationArray :: ', LocationArray);
                }

                let result = {
                  'PartArray':PartArrayResult,
                  'LocationArray': LocationArray,
                  'productId': ProductSku,
                  'currency': currency,
                  'FobArray': FobArray
                  // 'fobPostalCode':''
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
