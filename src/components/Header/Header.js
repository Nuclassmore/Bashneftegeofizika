import React, { Component } from 'react';
import './Header.css';
import MenuToolSet from '../MenuToolSet/MenuToolSet';

export default class Header extends Component {
	constructor(props){
			super(props);
			this.state ={ 
			}
			this.openToolMenu = this.openToolMenu.bind(this);
			this.showForm = this.showForm.bind(this);
		}

    render() {
        return (
        	<div className="header">        	
        	<div className="navbar">
            <div className="logo"></div>
        	{this.props.showToolsMenu && <div className={this.props.itemHoverToogle} onClick={this.openToolMenu}><span className="navbar__itemTitle">Инструменты</span></div>}
        	{this.props.hideForm && (<MenuToolSet hideThis={this.openToolMenu} openThisTool={(value) => this.openTool(value)}></MenuToolSet>)}
        	</div>
			{this.props.showToolsMenu && <div className="header-button" onClick={() => this.showForm("LayersListForm")}><div className="header-button__LayerIcon"></div>Слои</div>}
			{this.props.showToolsMenu && <div className="header-button" onClick={() => this.showForm("AddServiceForm")}><div className="header-button__Plus"></div>Добавить слой</div>}
        	{/* <div className="header-button">Выход</div> */}
        	</div>
        )
    }
    openToolMenu(){
    	let data = !this.props.hideForm;
    	this.props.onHideForm(data); 	
	}
	
	showForm(id){
    	this.props.toggleForm(id); 	
    }

    openTool(toolId){
    	this.props.openToolWorkForm(toolId);
    }
} 