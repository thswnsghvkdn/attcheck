const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const prompt = require('prompt')
const confirm  = require('confirm')
const cors = require('cors')  
const mysql = require('mysql2')
const month = new Date().getMonth() 
const week = parseInt(new Date().getDate() / 7)
const { cleardb }  = require('./config/key')
var studata = {att : [] , date : []} // 클라이언트에 보낼 학생 출석정보 객체 att는 출석여부를 저장하고 date는 해당 날짜를 저장한다.


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

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
        if(result) {
            var t = [] // 학생들의 출석 여부를 저장할 배열
            for(var j = 0 ; j < result.length ; j++) { // json 객체에서 출석정보만을 가져온다.
                t.push(result[j][_date])
            }
            studata.att.push(t) // 출석여부를 저장한 배열을 객체에 att 에 push 한다.
            studata.date.push(_date) // 해당 날짜를 push한다.
            if(m == 1 && w == 0) 
                res.send(studata) // 1월 0주차일 경우 모든 출석 정보가 객체에 저장되었으므로 클라이언트에 응답한다.
        }
    })
}





app.post('/save/' , (req, res) => {
    // m 과 w에 요청 받은 마지막 날짜로 초기화 한다.
    m = req.body.m + 1;
    w = req.body.w;
    console.log(req.body) 
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
app.post('/attendance' , (req , res) => {
    var students = req.body.students;
    var new_stu = students.split(' ') // 요청 받은 출석명단을 공백을 기준으로 토크나이징 한다.
    var date = '`' + req.body.m  + '-' + req.body.w + '`'; // 월-주 새로운 컬럼이름
    var dateStr = 'alter table students add ' + date + ' int null'; // DB에 새로운 컬럼을 추가한다.
    conn.query(dateStr, function(err, results){ // 해당 주차 열 생성
        for( var i in new_stu){
            var str = 'select * from students where name like' + conn.escape('%' + new_stu[i] +'%') // 출석인원의 아이디를 탐색할 명령문
            conn.query(str , function(err, results){
                if(err) ( err => console.log(err))
                if(results.length > 0 ) { // 결과가 1이상 일 때
                    var stuId = 0;
                    if(results.length > 1) stuId = makePrompt(new_stu[i] , results); // 동명이인의 경우 정확한 아이디를 탐색 
                    else stuId = results[0].id;
                    var str2 = 'update students set '+ date +' = 1 where id = ' + stuId; // 탐색된 아이디위치에 출석을 1로 표시할 명령문
                    conn.query(str2 , function(err , results){
                        if(err) (err => console.log(err))
                        else console.log("done!")
                    })
                }
            })   
        }

    })

    res.send('succeed')
})

var lists = [];
app.post('/load' , (req, res) => {
    if(lists.length >= 1) res.send(lists);
    var str = 'select id,name,univ,age from students'
    console.log(str)
    conn.query(str , function(err , results) {
        if(err) throw err;
        console.log("done")
        lists = results;
        res.send(lists);
    }) 
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