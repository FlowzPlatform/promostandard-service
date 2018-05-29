const fs = require('fs');

let ssl = process.env.cert ? { ca: fs.readFileSync(__dirname+process.env.cert) } : null;
let rauth = process.env.rauth ? process.env.rauth : null;

const config = require("config");
const table = 'promo_standard_location';

let r = require('rethinkdb')
let connection;
let response;
r.connect({
  host: config.get('rdb_host'),
  port: config.get("rdb_port"),
  authKey: rauth,
  ssl: ssl,
  db: config.get("rethinkdb").db
}, function(err, conn) {
  if (err) throw err;
  connection = conn
})

const feathers = require('feathers');
const app = feathers();
const _ = require('lodash');
module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
     hook => checkLocationExist(hook)
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [
      hook => afterCreate (hook)
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};


async function checkLocationExist(hook){
  //console.log(hook.data)
  count = 0;
  r.table(table).count()
    .run(connection , async function(error , cursor){
      if (error) throw error;
      count = cursor + 1;
      console.log("count",count);
  })
  restrictInsert = await restrictInsertFunc(hook)
  if(restrictInsert.status){
    // console.log("restrictInsert.locationToBeInserted ", restrictInsert.locationToBeInserted)
   
    if( restrictInsert.locationToBeInserted.length > 0){
      hook.data = []
      for (var i = 0; i < restrictInsert.locationToBeInserted.length; i++){
        hook.data.push({'location' : restrictInsert.locationToBeInserted[i],'location_id':count.toString()}) 
        count++;
      }
    }else{
      hook.result = restrictInsert.data;
    }
   // console.log("hook.datahook.datahook.datahook.data " , JSON.stringify(restrictInsert.data.data))
   // 
  }
  else{
    console.log("**********",hook.data)
    for (var i = 0; i < hook.data.length; i++){
      hook.data[i].location_id = count.toString();
      count++; 
    }
    console.log("-----------",hook.data)    
  }
 
  
}

async function restrictInsertFunc(hook){
  return new Promise((resolve , reject)=>{
    let dataArr = [];
    for (var i = 0; i < hook.data.length; i++){
      dataArr.push(hook.data[i].location)
    }
    let locationToBeInserted;
    hook.app.service("promoStandardLocation").find({
      query: {
        location: {
          $in: dataArr
        }
      }
    }).then(async items => {
      
      console.log(items)
      
      if(items.total > 0 ){
        //console.log(items)
        let dataArr2 = [];
        for (var i = 0; i < items.data.length; i++){
          dataArr2.push(items.data[i].location)
        }
        
        locationToBeInserted = _.difference(_.uniq(dataArr),_.uniq(dataArr2))
        console.log("locationToBeInserted",locationToBeInserted)

       resolve ({status:true , data:items , locationToBeInserted : locationToBeInserted })
      }else{
        resolve ({status:false  , locationToBeInserted : locationToBeInserted})
      }
    });
  })
}

function afterCreate (hook) {
  
  if(hook.data.id != undefined){
    
  console.log(">>>>>&&&&>>>>>>>>>> " , restrictInsert)
    if(restrictInsert.locationToBeInserted != undefined && restrictInsert.data.data.length > 0){
      restrictInsert.data.data.push(hook.result);
      console.log("hook.datahook.datahook.datahook.data " , JSON.stringify(restrictInsert.data.data))
     
    }
  }
  if(restrictInsert.locationToBeInserted != undefined){
    hook.result = restrictInsert.data.data
  }
 
  
}