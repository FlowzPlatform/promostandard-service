const config = {
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
  domainKey: 'http://localhost:3032/'
};
module.exports = config;


 