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
    month : -1,
    week : -1,
    students : ""
  }
  constructor(props){
    super(props);
    this.state = {
      month : -1 ,
      date : -1 ,
      students : "",
    }
  }

 fileHandler = (e) => {
  const files = e.target.files[0];
  const wb = new Excel.Workbook();
  const reader = new FileReader()
 
  reader.readAsArrayBuffer(files)
  reader.onload = () => {
    const buffer = reader.result;
    wb.xlsx.load(buffer).then(data => {
    // axios로 서버에 DB에 저장된 출석정보를 요청한다
    axios.post('/save' , { m : this.state.month , w : this.state.date } ).then( response =>{ 
      console.log(response);
      savefile( wb, response.data ); // 받아온 엑셀에 수정하기
      wb.xlsx.writeBuffer().then(function (data) {
            const blob = new Blob([data],
              { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'download.xlsx';
            anchor.click();
            window.URL.revokeObjectURL(url);
          }); 
        })
      })
  }
  }
   date = (e) =>{
       console.log(e.target);
       var str = e.target.value;
       var m = Number(str[5]);
       var month = m * 10 + Number(str[6]);
       var d = Number(str[8]);
       var date = d * 10 + Number(str[9]);
       this.state.month = month;
       this.state.date = date;
       console.log(this.state);
       debugger;
   }
   attendance = (e) =>{
    this.state.students = e.target.value;
   }
   attcheck = (e) => {
     debugger;
     axios.post('/attendance' , {students : this.state.students , m : this.state.month , w : Math.floor(this.state.date / 7)} ).then (response =>{
     })
   }

render = () => {
  return (
    <div className="App">
      <input type="file" multiple onChange={this.fileHandler}/>
      <input type = "date" id = "myDate" multiple onChange={this.date} />
      <p><textarea cols = "50" rows = "10" multiple onChange = {this.attendance}></textarea></p>
      <p><input type = "button" value = "submit" multiple onClick = {this.attcheck} ></input></p>
    </div>
  );
  }
}

export default App;
