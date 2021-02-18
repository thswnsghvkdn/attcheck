import React from 'react';
import axios from 'axios';
import Excel from 'exceljs'

// 서버에서 넘어온 객체를 가지고 엑셀을 수정 
function savefile( wb , stu) 
{
  console.log(stu);
  for(var i = 0 ; i < stu.att.length ; i++)
  {
      var _date = stu.date[i]; // '2-1' 과 같이 월과 주가 객체로 전달된다.
      var m = Number(_date[0]) // sheet 과 cell을 찾기 위해 date 문자열 파싱
      var c = Number(_date[2])
      for(var j = 0 ; j < stu.att[i].length ; j++) // 출석정보를 담은 배열에서 한명한명의 출석유무를 판별
      {
          if(stu.att[i][j] === 1){ // 출석을 의미하는 1이면 엑셀에 체크
            wb.worksheets[m + 1].getRow(5 + j).getCell(16 + c).value = 1;
            }
      }
  }
}

class App extends React.Component {
  state = {
    month : -1, // 해당월 
    week : -1, // 해당 주차
    students : "", // 출석 명단
    wtype : true, // 예배 종류 true = 본 예배
  }
  constructor(props){
    super(props);
    this.state = {
      month : -1 ,
      week : -1 ,
      students : "",
    }
  }
  // 파일을 업로드하면 해당 파일에 데이터베이스의 명단을 가지고 수정하여 새파일을 다운로드한다.
 fileHandler = (e) => {
  var filename = this.state.month + "월 " + this.state.week + "주차 대학부 출석";
  // 업로드한 파일을 저장한다.
  const files = e.target.files[0];
  const wb = new Excel.Workbook();
  const reader = new FileReader()
 
  reader.readAsArrayBuffer(files)
  reader.onload = () => {
    const buffer = reader.result;
    wb.xlsx.load(buffer).then(data => {
    // axios로 서버에 DB에 저장된 출석정보를 요청한다
    axios.post('/save' , { m : this.state.month , w : this.state.week } ).then( response =>{ 
      savefile( wb, response.data ); // 받아온 엑셀에 수정하기
      wb.xlsx.writeBuffer().then(function (data) {
            const blob = new Blob([data],
              { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = filename +'.xlsx';
            anchor.click();
            window.URL.revokeObjectURL(url);
          }); 
        })
      })
  }
  }
  // 날짜를 스테이트에 저장
   date = (e) =>{
      // 태그의 value는 'yyyy-mm-dd' 와 같은 문자열이기에 정수로 파싱한다.
       var str = e.target.value;
       var m = Number(str[5]);
       var month = m * 10 + Number(str[6]); // 두 자리수 변환
       var d = Number(str[8]);
       var date = d * 10 + Number(str[9]); // 두 자리수 변환
       this.state.month = month;
       this.state.week = Math.floor( date / 7); // 날짜를 주차로 변환한다.
       console.log(this.state);
       debugger;
   }
   // 출석명단을 스테이트에 저장한다.
   attendance = (e) =>{
    this.state.students = e.target.value;
   }
   // 서버에 출석명단을 보낸다.
   attcheck = (e) => {
     // 출석명단과 날짜를 객체로 서버에 보낸다.
     axios.post('/attendance' , {students : this.state.students , m : this.state.month , w : this.state.week } ).then (response =>{
       console.log(response.data)
     })
   }

render = () => {
  return (
    <div className="App">
      <input type="file" multiple onChange={this.fileHandler}/>{/* 명단을 저장할 엑셀 파일을 올리기위한 태그 */}
      <input type = "date" id = "myDate" multiple onChange={this.date} />{/*출석한 월과 주를 표시할 태그 */}
      <p><textarea cols = "50" rows = "10" multiple onChange = {this.attendance}></textarea></p>{/* 출석명단 */}
      <p><input type = "button" value = "submit" multiple onClick = {this.attcheck} ></input></p>{/* 서버에 보내기위한 submit 버튼 */}
    </div>
  );
  }
}

export default App;
