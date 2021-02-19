import React from 'react';

class CheckName extends React.Component {
    render = () => {
        var lists = [];
        var data = this.props.people;
        for(var i  = 0 ; i < data.length ; i++)
        {
            lists.push(<span><input key ={i} type ="radio" name = "students" value = {i}>{data[i].name +' '+ data[i].univ + ' ' + data[i].age }</input></span>)
        }
        return (
          <div className="CheckName">
            {this.props.name}이름이 중복 되었습니다. 정확한 학생을 골라주세요<br/>
            {lists}
            <input type = "button">확인</input>
          </div>
        );
    }
}

export default CheckName;

