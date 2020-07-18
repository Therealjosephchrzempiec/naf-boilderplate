const { uuid } = require('uuidv4');
 
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('.data/db.json');
const db = low(adapter); 

if(process.env.ADMIN_KEY.length > 0  && !process.env.DB_INITIALIZED){
  
 process.env.DB_INITIALIZED = true;
  // Set some defaults (required if your JSON file is empty)
 db.defaults({ users: [{ id:uuid(), name: 'admin', pw: process.env.ADMIN_KEY, isPlaying:false }]})
   .write();
  db.get('users').filter({isPlaying:true}).map(u=>{
    u.isPlaying = false;
    return u
  }).write();
  db.get('users').filter({name:'admin'}).map(u=>{
    if(u.pw != process.env.ADMIN_KEY)u.pw = process.env.ADMIN_KEY;
    return u
  }).write();
  db.get('users').value().forEach(user=>{
    console.log(user.name, user.pw); 
  });
} else {
  //console.log('Set the value of ADMIN_KEY in .env, for example ADMIN_KEY="34crrg344"');
}   

           
module.exports = db;  