import React, { Component } from 'react';
import './Home.css';
import Header from './Header/Header';
import MapContainer from './Map/Map';

export default class Home extends Component {
  constructor(props){
    super(props);
    this.state = {
      show: false,
      firstTool: false,
      attributeTable: false,
      activateTool: null,
      itemHover: "navbar__item",
      showLayer: false,
      showToolsMenu: false,
      LayersListForm: false,
      AddServiceForm: false,
    }
    this.toogler = this.toogler.bind(this);
    this.addFeatureLayerService = this.addFeatureLayerService.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
  }
  render() {
    return (
      <div onMouseDown={(event) => this.closeMenuForm(event)}>
      <div className="App App-header">
        <Header showToolsMenu = {this.state.showToolsMenu} 
        toggleForm = {(formId) => this.toggleForm(formId)}
        hideForm={this.state.show} 
        itemHoverToogle={this.state.itemHover} 
        onHideForm={this.toogler} 
        openToolWorkForm={(value) => this.openToolForm(value)}/>       
      </div>
      <div className="App-body">
        <MapContainer showLayer = {this.state.showLayer} 
        showLayersListForm = {this.state.LayersListForm} 
        showLayerAddForm = {this.state.AddServiceForm} 
        toggleForm = {(formId) => this.toggleForm(formId)}
        addFeatureLayerService = { () => this.addFeatureLayerService()}
        workToolId={this.state.activateTool} 
        closeThisForm={(id) => this.close(id)} 
        openToolWorkForm={(value) => this.openToolForm(value)}
        showHeadersTools={() => this.showHeadersTools()}
        />
      </div>
      </div>
    );
  }

  toggleForm(formId){
    if(formId === "AddServiceForm"){
      this.setState({["LayersListForm"]: false});
    }
    let toggle = !this.state[formId];
    this.setState({[formId]: toggle});
  }

  openToolForm(toolId){
    let toggle = !this.state[toolId];
    this.setState({[toolId]: toggle});
    this.setState({activateTool: toolId});
    if(toolId.includes("Tool"))
      this.toogler(false);
  }

  close(toolId){
    this.setState({[toolId]: false});
    this.setState({activateTool: null});
  }

  toogler(flag){
    this.setState({show: flag});
    if(flag)
        this.setState({itemHover: "navbar__item navbar__itemActive"})
    else
        this.setState({itemHover: "navbar__item"})
  }

  addFeatureLayerService(){
    this.setState({showLayer: true})
  }

  showHeadersTools(){
    this.setState({showToolsMenu: true})    
  }

  closeMenuForm(event){
    let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    if (!elemBelow) return;
    let droppableBelow = elemBelow.closest('.Form');
    let droppableBelowNavbarItem = elemBelow.closest('.navbar__item');
    let droppableBelowNavbarItemTitle = elemBelow.closest('.navbar__itemTitle');
    if(droppableBelow === null && droppableBelowNavbarItem === null && droppableBelowNavbarItemTitle === null){
      this.setState({show: false});
      this.setState({itemHover: "navbar__item"});
    }
  }
}
