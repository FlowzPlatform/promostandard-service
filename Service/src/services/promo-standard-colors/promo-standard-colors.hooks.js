const fs = require('fs');

let ssl = process.env.cert ? { ca: fs.readFileSync(__dirname+process.env.cert) } : null;
let rauth = process.env.rauth ? process.env.rauth : null;

const config = require("config");
const table = 'promo_standard_colors';

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
     hook => checkColorsExist(hook)
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
      hook => afterCreateColor(hook)
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


async function checkColorsExist(hook){
  //console.log(hook.data)
  count = 0;
  r.table(table).count()
    .run(connection , async function(error , cursor){
      if (error) throw error;
      count = cursor + 1;
      console.log("count",count);
  })
  restrictInsert = await restrictInsertColorFunc(hook)
  if(restrictInsert.status){
    if( restrictInsert.colorToBeInserted.length > 0){
      hook.data = []
      for (var i = 0; i < restrictInsert.colorToBeInserted.length; i++){
        hook.data.push({'name' : restrictInsert.colorToBeInserted[i],'color_id':count.toString()}) 
        count++;
      }
    }else{
      hook.result = restrictInsert.data;
    }
  }
  else{
    console.log("**********",hook.data)
    for (var i = 0; i < hook.data.length; i++){
      hook.data[i].color_id = count.toString();
      count++;
    }
    console.log("-----------",hook.data)    
  }
 
  
}

async function restrictInsertColorFunc(hook){
  return new Promise((resolve , reject)=>{
    let dataArr = [];
    for (var i = 0; i < hook.data.length; i++){
      dataArr.push(hook.data[i].name)
    }
    let colorToBeInserted;
    hook.app.service("promoStandardColors").find({
      query: {
        name: {
          $in: dataArr
        }
      }
    }).then(async items => {
      if(items.total > 0 ){
        let dataArr2 = [];
        for (var i = 0; i < items.data.length; i++){
          dataArr2.push(items.data[i].name)
        }
        colorToBeInserted = _.difference(_.uniq(dataArr),_.uniq(dataArr2))

       resolve ({status:true , data:items , colorToBeInserted : colorToBeInserted })
      }else{
        resolve ({status:false  , colorToBeInserted : colorToBeInserted})
      }
    });
  })
}

function afterCreateColor (hook) {
  
  if(hook.data.id != undefined){
    
  console.log(">>>>>&&&&>>>>>>>>>> " , restrictInsert)
    if(restrictInsert.colorToBeInserted != undefined && restrictInsert.data.data.length > 0){
      restrictInsert.data.data.push(hook.result);
      console.log("hook.datahook.datahook.datahook.data " , JSON.stringify(restrictInsert.data.data))
     
    }
  }
  if(restrictInsert.colorToBeInserted != undefined){
    hook.result = restrictInsert.data.data
  }
 
  
}