import React, { Component } from 'react';
import './MenuToolSet.css';

export default class MenuToolSet extends Component {
	constructor(props){
		super(props);
		this.state = {  
                firstTool: false
		}
        this.openToolWorkForm = this.openToolWorkForm.bind(this);
	}

    render() {
        return (
        	<div className="Form"> 
            <div className="Menu__itemtitle"><span className="Form__titlespan">Инструменты</span></div>           
            <div id="firstTool" className="Menu__item" onClick={() => this.openToolWorkForm("firstTool")}><h4>Анализ изученности участка</h4></div>     
        	</div>
            )	
    }

    openToolWorkForm(toolid){
        this.props.openThisTool(toolid);        
    }
}