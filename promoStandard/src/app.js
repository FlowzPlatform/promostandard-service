/*jslint node: true */
"use strict";

let soap = require('soap');
let express = require('express');
let fs = require('fs');
let commonFunction = require("./commonfunction");

const path = require('path');
const config = require('./config');
let app = express();


const ProductDataService = require("./productdataservice");
const MediaContentService = require("./mediadataservice");
const ProductPriceService = require("./productpriceservice");

// load the WSDL file
let ProductDataServiceWSDL = fs.readFileSync(config.productdatawsdlPath + config.productdata, 'utf8');
let MediaDataServiceWSDL = fs.readFileSync(config.mediadatawsdlPath + config.mediacontent, 'utf8');
let ProductPriceServiceWSDL = fs.readFileSync(config.productpricewsdlPath + config.pricingconfiguration, 'utf8');


// load the wsdl file schema defination
app.use('/wsdl', express.static(path.join(__dirname, config.dirup + config.productdatawsdlPath)))
app.use('/wsdl', express.static(path.join(__dirname, config.dirup + config.mediadatawsdlPath)))
app.use('/wsdl', express.static(path.join(__dirname, config.dirup + config.productpricewsdlPath)))

// root handler
// app.get('/', function (req, res) {
//   res.send('Node Soap Example!<br />');
// })

// Launch the server and listen
app.listen(config.port, function () {
  soap.listen(app, config.productdata, ProductDataService, ProductDataServiceWSDL);
  soap.listen(app, config.mediacontent , MediaContentService, MediaDataServiceWSDL);
  soap.listen(app, config.pricingconfiguration , ProductPriceService, ProductPriceServiceWSDL);
  console.log("Check http://localhost:" + config.port + config.pricingconfiguration +"?wsdl to see if the service is working");
});