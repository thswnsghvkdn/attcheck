import React from 'react';
import axios from 'axios';
import Excel from 'exceljs'

class App extends React.Component {
  studentsInfo = []; // 서버에서 가져 올 학생 명단
  month = -1; // 사용자가 입력 한 월
  week = -1; // 사용자가 입력 한 주차
  students = ""; // 출석 학생 명단
  excelFile = null; // 출석정보를 작성할 파일
  serveType = "1,2부";
  attendanceLists = []; // 서버에 보낼 출석한 아이디 배열
  sameName = { // 동명이인 객체
    name : "",
    people : [],
  }
  constructor(props){
    super(props);
    // 함수들에 this 를 bind 시킨다.
    this.loadData = this.loadData.bind(this);
    this.fileWrite = this.fileWrite.bind(this);
    this.state = { // ui에 영향을 주는 부분  setState를 호출하여 리렌더가 필요한 부분을 포함한다.
    }
  }
handleOptionChange = e =>{
  this.serveType = e.target.value;
}
// 서버에서 넘어온 객체를 가지고 엑셀을 수정 
savefile( wb , stu) 
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


// prompt 띄우기 
makePrompt(name ,results)
{
    var body = name + "이름이 중복 되었습니다. 정확한 학생의 번호를 입력해주세요\n";
    var index = {}
    var id = -990;
    do{
      if(id === -990) { // 처음시작할때에만 메시지를 작성한다.
        for(var i = 0 ; i < results.length ; i++) // 동명이인 정보를 메시지로 만든다. 
        {
            body += results[i].id  + ' ' + results[i].name + ' ' + results[i].univ + ' ' + results[i].age + '살\n';
            index[results[i].id] = i; // 학생아이디를 인덱스로 results를 되찾아가기 위해 만드는 배열
        }
      }
      var id = Number(prompt(body)); 
      if(isNaN(id) || index[id] == null) // prompt 반환값이 숫자인지 유효한 학생아이디인지 검사
      {
        alert("이름 왼쪽에 있는 숫자를 제대로 입력해주세요!")
      }
      else break;
  }while(1);
  // 학생 아이디는 동명이인의 정보를 저장하고 있는 배열의 인덱스이다. 
  var message = results[index[id]].id  + ' ' + results[index[id]].name + ' ' + results[index[id]].univ + ' ' + results[index[id]].age + '살 학생이 맞나요?';
  while(1){
    var flag = window.confirm(message); // 선택한 학생이 맞는지 다시 확인한다.
    if(flag === false) var id = Number(prompt(body)) 
    else return id;
    var message = results[index[id]].id  + ' ' + results[index[id]].name + ' ' + results[index[id]].univ + ' ' + results[index[id]].age + '살 학생이 맞나요?';
  };
  return id;
}


// 출석 명단을 가지고 학생 명부에서 찾는다.
findStudent(student)
{
  this.sameName.people = []; // 동명이인을 확인 할 배열
  for(var i = 0 ; i < this.studentsInfo.length ; i++)
  {
    if(this.studentsInfo[i].name.includes(student))  // 인수로 들어온 학생이 학생 명부에 학생과 일일히 대조한다.
    { 
      this.sameName.name = student;
      this.sameName.people.push(this.studentsInfo[i]); // 동명이인이 있을경우를 위해 동명이인 배열에 출석학생정보를 추가한다.
    }
  }
  if(this.sameName.people.length < 1)
  {
    alert(student + "학생이 출석명단에 없습니다 오타에 주의해주세요");
  }
  else if(this.sameName.people.length > 1){ // 동명이인 배열에 두명이상이 들어가있는 경우에는 정확한 학생아이디를 받는다. 
    this.attendanceLists.push(this.makePrompt(student, this.sameName.people));
  }
  else this.attendanceLists.push(this.sameName.people[0].id);
}


  // 파일을 업로드하면 해당 파일에 데이터베이스의 명단을 가지고 수정하여 새파일을 다운로드한다.
 fileWrite = () => {
  if(this.excelFile === null)
  {
    alert("수정할 엑셀 파일을 첨부 해 주세요!");
    return;
  }
  if(this.month === -1)
  {
    alert("날짜를 입력해주세요 (해당 날짜까지 엑셀에 작성됩니다!)");
    return;  
  }
  var week = this.week * 2 + 1; // 해당 주차 * 2 + 1 (각 주차마다 예배가 두개씩 있으므로 * 2)
  var filename = this.month + "월 " + week + "주차 대학부 출석";
  // 업로드한 파일을 저장한다.
  const files = this.excelFile;
  const wb = new Excel.Workbook();
  const reader = new FileReader()
 
  reader.readAsArrayBuffer(files)
  reader.onload = () => {
    const buffer = reader.result;
    wb.xlsx.load(buffer).then(data => {
    // axios로 서버에 DB에 저장된 출석정보를 요청한다
    axios.post('api/students/reqDB' , { m : this.month , w : this.week } ).then( response =>{ 
      this.savefile( wb, response.data ); // 받아온 엑셀에 수정하기
      wb.xlsx.writeBuffer().then(function (data) {
            const blob = new Blob([data],
              { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = filename +'.xlsx';
            anchor.click();
            window.URL.revokeObjectURL(url);
            console.log("donwn")
          }); 
        })
      })
    }
  }


// 업로드된 엑셀 파일에서 학생 정보를 가져와 서버에 넘겨 DB에 저장한다.
loadData = () => {
  // 업로드한 파일을 저장한다.
  const files = this.excelFile;
  const wb = new Excel.Workbook();
  const reader = new FileReader();
  reader.readAsArrayBuffer(files);
  reader.onload = () => {
    const buffer = reader.result;
    wb.xlsx.load(buffer).then(data => {
        // axios로 서버에 DB에 저장된 출석정보를 요청한다
        var lists = []; // 학생들의 정보를 저장한다.
        var num = 0;
        while(1)
        {
          var obj = {
           id: 1, name : "" , univ : "" , age : 1
          };
          obj.id = wb.worksheets[3].getRow(5 + num).getCell(1).value;
          obj.name = wb.worksheets[3].getRow(5 + num).getCell(5).value;
          obj.univ = wb.worksheets[3].getRow(5 + num).getCell(6).value;
          obj.age = Number(wb.worksheets[3].getRow(5 + num).getCell(13).value);
          if(obj.name == undefined || obj.name === "") break;
          lists.push(obj);
          num++;
        }
        axios.post('api/students/stuInfo' , { info : lists } ).then( response =>{ 
          console.log("done");
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
       this.month = month;
       this.week = Math.floor( date / 7) * 2; // 날짜를 주차로 변환한다.
       console.log(this);
   }
   // 출석명단을 스테이트에 저장한다.
   attendance = () =>{
    if(this.month === -1) 
    {
      alert("날짜를 체크 해주세요");
      return;
    }

    this.attendanceLists = [];
    var students = this.students;
    var new_stu = students.split(' ') // 요청 받은 출석명단을 공백을 기준으로 토크나이징 한다.
    if(this.studentsInfo === null)
    { 
      axios.post('api/students/load' ).then(response =>{
        if(this.studentsInfo.length === 0)
         this.studentsInfo = response.data;
         for(var i in new_stu){
          this.findStudent(new_stu[i]);
        } 
      })
    }
    else {
      for(var i in new_stu){
        this.findStudent(new_stu[i]);
      } 
    }
    var week = this.week * 2;
    if(this.serveType === "대학부") {
      week++;
    }
    var message = this.month +"월 " + this.week + "주차" + this.serveType + " 출석이 맞나요?";
    if(window.confirm(message)) {
      axios.post('api/students/attendance' , {lists : this.attendanceLists , m : this.month , w : week }).then(response =>{
        alert("출석명단을 저장하였습니다.")
      })
    }
  }


render = () => {

  return (
    <div className="App">
      <p><textarea cols = "50" rows = "10" multiple onChange = {function(e){ this.students = e.target.value}.bind(this)}></textarea></p>{/* 출석명단 */}
      <input type = "button" value = "출석명단 저장" multiple onClick = {this.attendance} ></input>{/* 출석 명단을 DB에 저장 */}
      <input type = "button" value = "엑셀파일 수정" multiple onClick = {this.fileWrite} ></input>{/* 서버에서 학생데이터를 가져와 파일 수정 */}
      {/*<input type = "button" value = "load" multiple onClick = {this.loadData} ></input>{/* 서버에 보내기위한 submit 버튼 */}
      <input type = "date" id = "myDate" multiple onChange={this.date} />{/*출석한 월과 주를 표시할 태그 */}
      <input type='radio'name='serve' value = "1,2부"  checked = {true} onChange = {this.handleOptionChange}/>1,2부
       <input type='radio'name='serve' value = "대학부" onChange = {this.handleOptionChange}/>대학부
      <p>학생 명단 업로드</p>
      <input type="file" multiple onChange={function(e) {this.excelFile = e.target.files[0] }.bind(this)} />{/* 명단을 저장할 엑셀 파일을 올리기위한 태그 */}
    </div>
  );
  }
}
export default App;