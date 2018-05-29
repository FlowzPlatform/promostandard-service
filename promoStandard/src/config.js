// console.log(process.env.serviceUrl)
let config = {
  dirup: '../',
  port:8000,
  productdatawsdlPath: "wsdl/ProductData",
  mediadatawsdlPath: "wsdl/ProductMedia",
  productpricewsdlPath: "wsdl/ProductPricing",
  productdata: "/ProductDataService.wsdl",
  mediacontent: "/MediaContentService.wsdl",
  pricingconfiguration: "/PricingAndConfiguration.wsdl",
  pdmurl : "http://api.flowzcluster.tk/pdmnew/pdm",
  authroute: "http://api.flowzcluster.tk/pdmnew/promostandard-auth",
  mediaUrl: "http://api.flowzcluster.tk/",
  customQueryRoute: '/run/fullquery',
  serviceUrl: 'http://localhost:3080'
};
if (process.env.serviceUrl != undefined) {
  config.serviceUrl = process.env.serviceUrl;
}
module.exports = config;


 