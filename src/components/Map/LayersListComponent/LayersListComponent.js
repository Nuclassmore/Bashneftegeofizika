import React, { Component } from 'react';
import './LayersListComponent.css';

export default class LayersListComponent extends Component {
	constructor(props){
		super(props);
		this.state = { 
        }        
    }

    render() {
        return (
        	<div className="LayersList__Block"> 
                <div className="LayersList__Title">Слои</div>
                <div className="LayersList__InnerBlock">{this.props.LayersList.map((layer, index) => { if(layer.id.includes('PrivateCreateLayer')) return <div key={index} className="LayersList__Item" ><div title="Таблица" className="LayersList__TableIcon" onClick={() => this.props.openTable(layer.id)}></div><div className="LayersList__Label"><span>{layer.source && layer.source.layerDefinition && layer.source.layerDefinition.name ? layer.source.layerDefinition.name : layer.id.replace('PrivateCreateLayer', '') }</span></div><div className="LayersList__Checkbox" ><input type="checkbox" id={layer.id} onChange={(event) => {this.props.toggleLayer(event.target.id, layer.visible, index);}} title="Скрыть слой" checked={this.props.LayersList[index].visible}/></div></div>})}</div>   
        	</div>
            )	
    }

}