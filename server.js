const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const cors = require('cors')  // allows/disallows cross-site communication
const mysql = require('mysql2')
const month = new Date().getMonth() 
const week = parseInt(new Date().getDate() / 7)
const { cleardb }  = require('./config/key')



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

// --> Add this
// ** MIDDLEWARE ** //
const whitelist = ['http://localhost:3000', 'http://localhost:8080', 'https://atttcheck.herokuapp.com']
const corsOptions = {
  origin: function (origin, callback) {
    console.log("** Origin of request " + origin)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      console.log("Origin acceptable")
      callback(null, true)
    } else {
      console.log("Origin rejected")
      callback(new Error('Not allowed by CORS'))
    }
  }
}
// --> Add this
app.use(cors(corsOptions))



// --> Add this
if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
// Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

var conn = mysql.createConnection({
    host : cleardb.host ,
    user : cleardb.user ,
    password : cleardb.password ,
    database : cleardb.schema
});

conn.connect( (err) =>{
    if(err){
        console.log(err)
    }
    else {
        console.log('DB connected')
    }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, (req, res) => {
    console.log(`server listening on port: ${PORT}`)
  });