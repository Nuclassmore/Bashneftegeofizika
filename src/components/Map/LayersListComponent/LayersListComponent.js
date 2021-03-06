import React, { Component } from 'react';
import './LayersListComponent.css';
import ReactDOM from 'react-dom';

export default class LayersListComponent extends Component {
	constructor(props){
		super(props);
		this.state = { 
            modalSettingsId: "",
            layerListBlockScroll: 0
        }        
        this.openModalTooltip = this.openModalTooltip.bind(this);
        this.onInnerBlockScroolEvent = this.onInnerBlockScroolEvent.bind(this);
        this.zoomToLayer = this.zoomToLayer.bind(this);
        this.removeLayer = this.removeLayer.bind(this);
        this.openTable = this.openTable.bind(this);
    }

    onInnerBlockScroolEvent(){
        this.setState({modalSettingsId: ""})
    }

    render() {
        return (
        	<div className="LayersList__Block"> 
                <div className="LayersList__Title">Слои</div>
                <div className="LayersList__InnerBlock" onScroll={this.onInnerBlockScroolEvent}  ref={(node) => {this._layersList = node}}>{this.props.LayersList.map((layer, index) => { if(layer.id.includes('PrivateCreateLayer') && !layer.id.includes('PrivateSelect')) 
                    {
                    return <div key={index} className="LayersList__Item" >
                            <div className="LayersList__Checkbox">
                                <input type="checkbox" id={layer.id} onChange={(event) => {this.props.toggleLayer(event.target.id, layer.visible, index);}} title="Скрыть слой" checked={this.props.LayersList[index].visible}/>
                            </div>
                            <div className="LayersList__Label">
                            <span>{layer.source && layer.source.layerDefinition && layer.source.layerDefinition.name ? layer.source.layerDefinition.name : layer.id.replace('PrivateCreateLayer', '') }</span>
                            </div>
                            <div title="Свойства" className="LayersList__SettingsIcon" onClick={($event) => this.openModalTooltip($event, layer.id)}>
                                {this.state.modalSettingsId === layer.id && <div title="" style={{marginTop: -80 - this.state.layerListBlockScroll}}>
                                    <div onClick={($event) => {this.zoomToLayer($event, layer.id)}}>
                                        Приблизить
                                    </div>
                                    <div onClick={($event) => {this.openTable($event, layer.id)}}>
                                        Таблица
                                    </div>
                                    <div onClick={($event) => {this.removeLayer($event, layer.id)}}>
                                        Удалить
                                    </div>
                                </div>}
                            </div>
                        </div>}
                        })}
                </div>   
        	</div>
            )	
    }    


    zoomToLayer(e, id){
        this.setState({modalSettingsId: ""})
        e.stopPropagation(); 
        this.props.zoomToLayer(id);
    }

    openTable(e, id){
        this.setState({modalSettingsId: ""})
        e.stopPropagation(); 
        this.props.openTable(id);
    }

    removeLayer(e, id){
        this.setState({modalSettingsId: ""})
        e.stopPropagation(); 
        this.props.removeLayer(id);
    }
   
    openModalTooltip(e, id){
        e.persist()
        if(this.state.modalSettingsId === id)
            this.setState({modalSettingsId: ""})
        else
        {
            this.setState({modalSettingsId: id}, ()=>{
                var element = ReactDOM.findDOMNode(this._layersList)
                this.setState({layerListBlockScroll: element.scrollTop})
            })
        }        
    }

}