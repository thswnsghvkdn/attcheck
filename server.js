const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const cors = require('cors');
const mysql = require('mysql2');
const cookieParser = require('cookie-parser');
const { cleardb }  = require('./config/key');
const jwt = require('jsonwebtoken');
const { auth } = require('./middleware/auth');
const { UV_FS_O_FILEMAP } = require('constants');
var studata = {att : [] , date : []} // 클라이언트에 보낼 학생 출석정보 객체 att는 출석여부를 저장하고 date는 해당 날짜를 저장한다.


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser())

// 코스 설정 
// 화이트 리스트 설정 로컬의 클라이언트 , 백엔드와 헤로쿠 url을 등록해놓는다.
const whitelist = ['http://localhost:3000', 'http://localhost:8080', 'https://atttcheck.herokuapp.com']
const corsOptions = {
  origin: function (origin, callback) {
    // 요청한 url을 표시한다
    console.log("** Origin of request " + origin)
    // 화이트 리스트에 있는 요청을 허락한다.
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      console.log("Origin acceptable")
      callback(null, true)
    } else {
      console.log("Origin rejected")
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions))


// mysql 연결 
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

// 인수로 받은 날짜 정보로 sql 명령문을 만들어 DB에 해당 주차에 대한 출석 column을 받아온다.
function make_obj(m , w, res)
{
    var _date =   m + '-' + w ; // 월 - 주차 
    var str = 'select `'+ _date + '` from students' // 해당 컬럼 전체를 가져오기 위한 명령문
    conn.query(str ,function(err, result){
        if(result.length  > 0) {
            var t = [] // 학생들의 출석 여부를 저장할 배열
            for(var j = 0 ; j < result.length ; j++) { // json 객체에서 출석정보만을 가져온다.
                t.push(result[j][_date])
            }
            studata.att.push(t) // 출석여부를 저장한 배열을 객체에 att 에 push 한다.
            studata.date.push(_date) // 해당 날짜를 push한다.
        }
        if(m == 1 && w == 0) 
          res.send(studata) // 1월 0주차일 경우 모든 출석 정보가 객체에 저장되었으므로 클라이언트에 응답한다.
    })
}
// 아이디와 비밀번호가 일치하면 토큰을 생성한다.
app.post('/api/users/login', (req, res) =>{
    var name =  req.body.name;
    var password = req.body.password;
    // 아이디와 비밀번호로 DB에 유저를 확인한다.
    var str = 'select * from register where name = \'' + name + '\' && password = \'' + password + '\'';
    conn.query(str , function(err, result) {
        if(result.length > 0){ // 유저가 확인되었다면 토큰을 생성한다.
            var token = jwt.sign(name, 'secrett');
            var str = 'update register set token = \'' + token + '\' where name = \'' + name + '\'';
            conn.query(str, function(err, result){
                if(err) throw err;
                res.cookie('hooonn', token).status(200).json({login : "true"});
            })
        }
        else res.json({login : "false"});
    })
})

// 토큰을 이용하여 아이디를 복호화하고 해당 아이디와 토큰이 DB에 저장되어 있으면 인증처리를 한다.
app.get('/api/users/auth' , (req, res) =>{
    var token = req.cookies.hooonn;
    jwt.verify(token ,'secrett' , function(err, decoded){
        var str = 'select * from register where name = \'' + decoded + '\' && token = \'' + token + '\'';
        console.log(str);
        conn.query(str , function(err , result){
            if(result !== null && result.length > 0)
            {
                console.log(result);
                res.json({login : "true"});
            }
            else res.json({login : "false"});
        })
    })
})

// DB에서 토큰을 삭제하여 인증처리를 불가하도록 한다.
app.get('/api/users/logout' , (req, res) => {
    var token = req.cookies.hooonn;
    jwt.verify(token ,'secrett' , function(err, decoded){
        var str = 'update register set token = null where name = \'' + decoded +'\'';
        console.log(str);
        conn.query(str , function(err, result) {
            if(err) throw err;
            res.send("로그아웃 성공");
        })
    })
})

app.post('/api/students/sync' , (req, res) =>{
    var sync = req.body.info;
    console.log(sync.length)
    console.log(sync[4].length)

    for(var i = 0 ; i < sync.length ; i++) // 받아온 주차 만큼 반복
    {
        for(var j = 0 ; j < sync[i].length ; j++){
            var str = 'update students set ' + sync[i][j].date + '= ' + sync[i][j].att + " where id = " + sync[i][j].id;
            conn.query(str, (err, result)=>{
                if(err) throw err;
                if(i === 5 && j === 142)
                {
                    res.send("done");
                    console.log(str + "done");

                }
                if(i >= 5 && j >= 142) {
                    console.log(str);
                } 
            });
        }
    }
})
// DB에서 학생들의 출석 정보를 가져온다.
app.post('/api/students/reqDB' , (req, res) => {
    // m 과 w에 요청 받은 마지막 날짜로 초기화 한다.
    m = req.body.m + 1;
    w = req.body.w;
    while(m >= 1) // 요청 받은 마지막 날짜 부터 1월 까지 줄여가며 반복한다
    {
        make_obj(m , w, res) // str을 만들기위한 주차와 월을 변경해가며 함수를 호출한다.
        w--;
        if(w < 0) // 0주차 이전으로 갈 경우 이전 달로 보내기
        {
            m--; // 월 감소
            w = 9;
        }
    }
})

// 출석 부분 라우터
app.post('/api/students/attendance' , (req , res) => {
    var students = req.body.lists;
    var date = '`' + req.body.m  + '-' + req.body.w + '`'; // 월-주 새로운 컬럼이름
    var dateStr = 'alter table students add ' + date + ' int null'; // DB에 새로운 컬럼을 추가한다.
    conn.query(dateStr, function(err, results){ // 해당 주차 열 생성
        for( var i in students){ // 요청으로 온 학생 아이디 위치에 출석을 저장한다.
            var str = 'update students set '+date+ ' = 1 where id = ' + students[i];
            conn.query(str , function(err, results){
                if(err) ( err => console.log(err))
            })   
        }
    })
    res.send('succeed')
})

// 학생명단 가져오기
var lists = []; // DB에서 가져온 명단을 저장하기 위한 배열
app.post('/api/students/load' , (req, res) => {
    if(lists.length >= 1) res.send(lists); // 이미 이전 요청에 의해 명단이 저장되있다면 바로 명단을 응답한다.
    var str = 'select id,name,univ,age from students' // 모든 학생데이터에서 id name univ age를 가져온다.
    conn.query(str , function(err , results) {
        if(err) throw err;
        lists = results;
        res.send(lists); // DB 응답결과를 보낸다.
    }) 
})
// 학생정보를 클라이언트에서 가져와 DB에 저장
app.post('/api/students/stuInfo', (req, res) =>{
    var lists = req.body.info;
    for(var i = 0 ; i < lists.length ; i++)
    {
        var str = 'insert into students(id , name ,univ , age)' + ' values ('+ lists[i].id +', \''  +lists[i].name  + '\', \'' + lists[i].univ  + '\',' + lists[i].age   +' )';
        conn.query(str, function(err, results){
            if(err) { console.log(err); throw err;}
        })
    }
}) 

if (process.env.NODE_ENV === 'production') {
    //  정적 파일을 가져 올수 있도록 경로를 설정 하는 미들웨어
    app.use(express.static(path.join(__dirname, 'client/build')));
  // 정적 파일인 빌드된 클라이언트 html 파일을 사용자에게 보여준다.
    app.get('*', function(req, res) {
      res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

const PORT = process.env.PORT || 8080
app.listen(PORT, (req, res) => {
    console.log(`server listening on port: ${PORT}`)
  });