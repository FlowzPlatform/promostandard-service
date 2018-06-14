// console.log(process.env.serviceUrl)
let domainKey = "flowzcluster.tk";

if (process.env.domainKey != undefined) {
  domainKey = process.env.domainKey;
}

let config = {
  dirup: '../',
  port:8000,
  productdatawsdlPath: "wsdl/ProductData",
  mediadatawsdlPath: "wsdl/ProductMedia",
  productpricewsdlPath: "wsdl/ProductPricing",
  productdata: "/ProductDataService.wsdl",
  mediacontent: "/MediaContentService.wsdl",
  pricingconfiguration: "/PricingAndConfiguration.wsdl",
  domainKey: domainKey,
  pdmurl : "https://api."+domainKey+"/pdmnew/pdm",
  authroute: "https://api."+domainKey+"/pdmnew/promostandard-auth",
  mediaUrl: "http://image.promoworld.ca/migration-api-hidden-new/web/images/",
  customQueryRoute: '/run/fullquery',
  serviceUrl: 'http://localhost:3080',
  promoapi: 'promoapi'
};
if (process.env.serviceUrl != undefined) {
  // config.serviceUrl = process.env.serviceUrl;
  config.serviceUrl = "https://api."+domainKey+"/promoStandard";
}
// console.log(config);
module.exports = config;


 