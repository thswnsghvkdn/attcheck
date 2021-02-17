const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const cors = require('cors')  // allows/disallows cross-site communication
const mysql = require('mysql2')
const month = new Date().getMonth() 
const week = parseInt(new Date().getDate() / 7)
const { cleardb }  = require('./config/key')
var studata = {att : [] , date : []}



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

function make_obj(m , w, res)
{
    var _date =   m + '-' + w ; // 월 - 주차 
    var str = 'select `'+ _date + '` from students' // 해당 컬럼 전체를 가져오기 위한 명령문
    conn.query(str ,function(err, result){
        if(result) {
            var t = []
            for(var j = 0 ; j < result.length ; j++) // json 객체에서 출석정보만을 가져온다.
                t.push(result[j][_date])
                studata.att.push(t) // 출석정보 배열을 객체에 att 에 push 한다.
                studata.date.push(_date) // 해당 날짜를 push한다.

            if(m == 1 && w == 0) 
                res.send(studata) // 1월 0주차에 경우 출력한다.
            
        }
    })
}

function call_make(res)
{
    m = month + 1;
    w = week * 2 + 1;
    while(m >= 1) // 1월 까지 줄여가며 반복한다
    {
        make_obj(m , w, res) // str을 만들기위한 주차와 월을 변경해가며 함수를 호출한다.
        w--;
        if(w < 0) // 0주차 이전으로 갈 경우 이전 달로 보내기
        {
            m--; // 월 감소
            w = 9;
        }
    }
}

app.get('/save/' , (req, res) => {
    call_make(res);
})


// --> Add this
if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.resolve(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
      res.sendFile(path.resolve(__dirname, 'client/build', 'index.html'));
    });
  }

const PORT = process.env.PORT || 8080
app.listen(PORT, (req, res) => {
    console.log(`server listening on port: ${PORT}`)
  });