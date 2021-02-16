import React from 'react';
import axios from 'axios';
import Excel from 'exceljs'

function savefile( wb) // 서버에서 넘어온 객체를 가지고 엑셀을 수정 
{
  var res ={ att:
    [ [ 1, null, 1, 1 ],
    [ null, 1, null, 1 ]],
   date: [ '2-1' , '2-0'] };
   debugger;
    for(var i = 0 ; i < res.att.length ; i++)
    {
        var _date = res.date[i]; // '2-1' 과 같이 월과 주가 객체로 전달된다.
        var m = Number(_date[0]) // sheet 과 cell을 찾기 위해 date 문자열 파싱
        var c = Number(_date[2])
        for(var j = 0 ; j < res.att[i].length ; j++) // 출석정보를 담은 배열에서 한명한명의 출석유무를 판별
        {
            if(res.att[i][j] === 1){ // 출석을 의미하는 1이면 엑셀에 체크
              wb.worksheets[m + 1].getRow(5 + j).getCell(16 + c).value = 1;
              }
        }
    }
}

class App extends React.Component {
  constructor(){
   super()
   this.state = {
     name: "",
     message: ""
  }
 }

 state = {file : null}
 fileHandler = (e) => {
   const files = e.target.files[0];
     this.setState({
       files: files
     })
     const wb = new Excel.Workbook();
     const reader = new FileReader()
 
     reader.readAsArrayBuffer(files)
     reader.onload = () => {
       const buffer = reader.result;
       wb.xlsx.load(buffer).then(data => {
           
         savefile( wb); // 받아온 엑셀에 수정하기
 
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
     }
   }
   date = (e) =>{
       const d = e.target.date;
       debugger;
   }

render = () => {
  return (
    <div className="App">
      <input type="file" multiple onChange={this.fileHandler}/>
      <input type = "date" id = "myDate" multiple onChage={this.date} />
    </div>
  );
  }
}

export default App;
