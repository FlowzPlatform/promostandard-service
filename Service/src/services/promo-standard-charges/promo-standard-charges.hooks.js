const fs = require('fs');

let ssl = process.env.cert ? { ca: fs.readFileSync(__dirname+process.env.cert) } : null;
let rauth = process.env.rauth ? process.env.rauth : null;

const config = require("config");
const table = 'promo_standard_charges';

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
     hook => checkChargesExist(hook)
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
      hook => afterCreateCharge(hook)
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


async function checkChargesExist(hook){
  //console.log(hook.data)
  count = 0;
  r.table(table).count()
    .run(connection , async function(error , cursor){
      if (error) throw error;
      count = cursor + 1;
      console.log("count",count);
  })
  restrictInsert = await restrictInsertChargeFunc(hook)
  if(restrictInsert.status){
    // console.log("restrictInsert.chargeToBeInserted ", restrictInsert.chargeToBeInserted)
   
    if( restrictInsert.chargeToBeInserted.length > 0){
      hook.data = []
      for (var i = 0; i < restrictInsert.chargeToBeInserted.length; i++){
        hook.data.push({'charge' : restrictInsert.chargeToBeInserted[i],'chargeDescription' : restrictInsert.chargeToBeInserted[i],'chargeType' : restrictInsert.chargeToBeInserted[i],'charge_id':count.toString()}) 
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
      hook.data[i].chargeType = hook.data[i].charge; 
      hook.data[i].chargeDescription = hook.data[i].charge; 
      hook.data[i].charge_id = count.toString();
      count++; 
    }
    console.log("-----------",hook.data)    
  }
 
  
}

async function restrictInsertChargeFunc(hook){
  return new Promise((resolve , reject)=>{
    let dataArr = [];
    for (var i = 0; i < hook.data.length; i++){
      dataArr.push(hook.data[i].charge)
    }
    let chargeToBeInserted;
    hook.app.service("promoStandardCharges").find({
      query: {
        charge: {
          $in: dataArr
        }
      }
    }).then(async items => {
      if(items.total > 0 ){
        //console.log(items)
        let dataArr2 = [];
        for (var i = 0; i < items.data.length; i++){
          dataArr2.push(items.data[i].charge)
        }
         chargeToBeInserted = _.difference(_.uniq(dataArr),_.uniq(dataArr2))

       resolve ({status:true , data:items , chargeToBeInserted : chargeToBeInserted })
      }else{
        resolve ({status:false  , chargeToBeInserted : chargeToBeInserted})
      }
    });
  })
}

function afterCreateCharge (hook) {
  
  if(hook.data.id != undefined){
    
  console.log(">>>>>&&&&>>>>>>>>>> " , restrictInsert)
    if(restrictInsert.chargeToBeInserted != undefined && restrictInsert.data.data.length > 0){
      restrictInsert.data.data.push(hook.result);
      console.log("hook.datahook.datahook.datahook.data " , JSON.stringify(restrictInsert.data.data))
     
    }
  }
  if(restrictInsert.chargeToBeInserted != undefined){
    hook.result = restrictInsert.data.data
  }
 
  
}