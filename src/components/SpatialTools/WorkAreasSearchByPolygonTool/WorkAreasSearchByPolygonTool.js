import React, { Component } from 'react';
import './WorkAreasSearchByPolygonTool.css';
import {getAllFeatures} from '../../../services/Feature.service';
import { loadModules } from '@esri/react-arcgis'


export default class WorkAreasSearchByPolygonTool extends Component {
	constructor(props){
		super(props);
		this.state = {
            input: "",
            showError: false,
            vertixes: [],
            highlight: null,
            pointCollection: [],
            latitude: "",
            longitude: "",
            collapseMethod: "CoordsMethod",
            selectValue: "select"
		}
        this.getAllFeatures = getAllFeatures.bind(this);
        this.closeThis = this.closeThis.bind(this);
        this.findFeatures = this.findFeatures.bind(this);
        //this.handleChange = this.handleChange.bind(this);
        this.drawPolygon = this.drawPolygon.bind(this);
        this.handleChangeLatitude = this.handleChangeLatitude.bind(this);
        this.handleChangeLongitude = this.handleChangeLongitude.bind(this);
        this.addPointToCollection = this.addPointToCollection.bind(this);
        this.collapsePolygonMethod = this.collapsePolygonMethod.bind(this);
        this.removeGraphic = this.removeGraphic.bind(this);
        this.convertCoords = this.convertCoords.bind(this);
        this.onChangeSelect = this.onChangeSelect.bind(this);
    }

    componentDidMount(){
        //this.getAllFeatures();
    }

    onChangeSelect(e){
        this.setState({selectValue: e.target.value})
    }
    
    // handleChange(event) {
    //     this.setState({input: event.target.value});
    // }

    handleChangeLatitude(event) {
        this.setState({latitude: event.target.value});
    }

    handleChangeLongitude(event) {
        this.setState({longitude: event.target.value});
    }
    
    render() {
        return (
            <div className="WorkArea__ToolForm"> 
                <span className="Form__Close" onClick={this.closeThis}></span>
                <h4>Укажите координаты полигона для выборки</h4>
                <div className="collapsableLabel" id="CoordsMethod" ref="CoordsMethod" onClick={this.collapsePolygonMethod}>Ввести координаты</div>

                    {this.state.collapseMethod === "CoordsMethod" && <div className="collapsableBody" >
                    <div className="WorkArea__AddPoint"><input value={this.state.latitude} onChange={this.handleChangeLatitude} placeholder="latitude"/><input value={this.state.longitude} onChange={this.handleChangeLongitude} placeholder="longitude"/><div className="Form__button" onClick={this.addPointToCollection}>Добавить</div></div>
                    <div className="WorkArea__PointCollection"><table><thead><tr><td>latitude</td><td>longitude</td></tr></thead><tbody>{this.state.pointCollection.map((point, index) => {return <tr key={index} className="WorkArea__Point" ><td>{point.latitude}</td><td>{point.longitude}</td><td onClick={() => this.removePointFromCollection(index)}>-</td></tr>})}</tbody></table></div>
                    </div>}
                    
                    <div className="collapsableLabel" id="MouseMethod" ref="MouseMethod" onClick={this.collapsePolygonMethod}>Нарисовать мышью</div>
                    {this.state.collapseMethod === "MouseMethod" && <div className="collapsableBody">
                    <table><tbody>{this.props.selectPolygonCollection.length ? this.props.selectPolygonCollection.map((graphic, index) => {return <tr key={index} ><td style={{fontSize: 18 + 'px', display: 'inline'}}>{"Объект выборки - " + index}</td><td style={{display: 'table-cell'}}><div className="Form__button" onClick={()=>this.removeGraphic(index)}>Удалить</div></td></tr>}) : <tr className="WorkArea__backtext"><td>Нет полигонов для выборки</td></tr> }</tbody></table>
                    </div>}

                    <div className="WorkArea__ChooseLayers">
                        <div className="select__Label">Выбрать слой</div>
                        <select value={this.state.selectValue} onChange={this.onChangeSelect} className="WorkArea__SelectBox">
                            <option value="select">Выбрать</option>
                            {this.props.LayersList.map((layer, index) => { if(layer.id.includes('PrivateCreateLayer')) return <option key={index} value={index}> {layer.source && layer.source.layerDefinition && layer.source.layerDefinition.name ? layer.source.layerDefinition.name : layer.id.replace('PrivateCreateLayer', '') } </option>})}
                        </select>
                    </div>
                {/* <input className="Form__input" value={this.state.input} onChange={this.handleChange} placeholder="11.11,22.22;33.44,55.66;77.88,99.00;11.11,22.22"/> */}
                {this.state.showError && <span className="Error__message">*Введены не корректные данные</span>}
                <div className="Form__Buttons__Block">
                <div className="Form__button" onClick={this.findFeatures}>Поиск</div>
                </div>
        	</div>
            )	
        }      

    collapsePolygonMethod(event){
        if(event.target.id != this.state.collapseMethod ){;
            this.setState({collapseMethod: event.target.id})
            if(event.target.id === "MouseMethod")
                this.drawPolygon("on");
            else
                this.drawPolygon("off");
            this.removeGraphic(0, event.target.id);
            this.setState({selectValue: "select"})
        }
    }

    addPointToCollection(){
        if(this.state.latitude != "" && this.state.longitude != ""){
            var collect = this.state.pointCollection;
            var point = {};
            point.latitude = this.state.latitude;
            point.longitude = this.state.longitude;
            collect.push(point)
            this.setState({pointCollection: collect})
        }
    }

    removePointFromCollection(index){
        var collect = this.state.pointCollection;
        collect.splice(index, 1);
        this.setState({pointCollection: collect})
    }

    removeGraphic(index, method){
        if(method == undefined)
            this.props.removeGraphics(index, "MouseMethod");
        else
            this.props.removeGraphics(index, method);
    }
    
    drawPolygon(flag){
        this.props.startDrawPolygon(flag);
    }        
        
    //-100.78, 32.3;-66.07, 68.45;-80.21, 25.78;-64.78, 32.3

    findFeatures(){
        // var vertixes = this.state.input.replace(/ /g, '');
        // var splitedVert = [];
        // vertixes.split(';').forEach(item => splitedVert.push(item.split(',')));    
        // this.setState({vertixes: splitedVert}, () => {
            var vertixes = [];
            if(this.state.collapseMethod == "CoordsMethod" && this.state.pointCollection != [] && this.state.selectValue != "select"){
                this.state.pointCollection.forEach(point => {
                    var lon = point.longitude;
                    var lat = point.latitude;
                    var p = [];
                    p.push(lat);
                    p.push(lon);
                    vertixes.push(p);
                });
                if(vertixes[0] != vertixes[vertixes.length - 1])
                    vertixes.push(vertixes[0]);
                if(vertixes !== "" && vertixes.length >= 4){
                    var polygon = {
                        type: "polygon",
                        rings: vertixes
                    }
                    this.filterPolygonsByPolygon(polygon);
                }
                else{
                    this.setState({showError: true})
                } 
            }
            else if(this.state.collapseMethod == "MouseMethod" && this.props.selectPolygonCollection.length > 0 && this.state.selectValue != "select"){
                for(var i = 0; i < this.props.selectPolygonCollection.length; i++){  
                    if(this.props.selectPolygonCollection[i].geometry){ 
                        if(this.props.selectPolygonCollection[i].geometry.type === "polygon"){
                            vertixes = this.props.selectPolygonCollection[i].geometry.rings[0];

                            this.convertCoords(vertixes).then((result) => {
                                var polygon = {
                                    type: "polygon",
                                    rings: result
                                }
                                this.filterPolygonsByPolygon(polygon);
                            })
                        }         
                        else if(this.props.selectPolygonCollection[i].geometry.type === "polyline"){
                            vertixes = this.props.selectPolygonCollection[i].geometry.paths[0];

                            this.convertCoords(vertixes).then((result) => {
                                var polyline = {
                                    type: "polyline",
                                    paths: result
                                }
                                this.filterPolygonsByPolygon(polyline);
                            })
                        }  
                        else if(this.props.selectPolygonCollection[i].geometry.type === "point"){
                            var point = {
                                type: "point",
                                longitude: this.props.selectPolygonCollection[i].geometry.longitude,
                                latitude: this.props.selectPolygonCollection[i].geometry.latitude
                            }
                            this.filterPolygonsByPolygon(point);
                        } 
                    }  
                    else{
                        this.setState({showError: true})
                    }                                              
                }
            }   
            else{
                this.setState({showError: true})
            }            
            //});
        }
        
    filterPolygonsByPolygon(filterLayer){
        loadModules([
        "esri/layers/FeatureLayer","esri/symbols/SimpleFillSymbol","esri/geometry/geometryEngine"]).then(([FeatureLayer, SimpleFillSymbol, geometryEngine]) => {
        // var layers = this.props.map.layers.items.filter(item => item.id != "GraphicLayer" && (item.id.includes("featureLayer") || item.id.includes("searchAreaLayer")))  
        var layers = [];
        layers.push(this.props.map.layers.items[this.state.selectValue])        
        layers.forEach((layer)=>{  
            if(layer.geometryType === "polyline"){  
                var fields = layer.fields;
                var resultFeatures = [];
                var query = layer.createQuery();
                query.outFields = [ "*" ];
                layer.queryFeatures(query)
                .then((response) => {
                    this.setState({allfeatures: response.features});
                    response.features.forEach((feat)=>{
                        if(geometryEngine.intersects(feat.geometry, filterLayer)){
                            var intersectedGeom = geometryEngine.intersect(feat.geometry, filterLayer);
                            intersectedGeom.attributes = feat.attributes;
                            this.state.lengthSumm = this.state.lengthSumm + geometryEngine.geodesicLength(intersectedGeom, "meters");
                            resultFeatures.push(intersectedGeom);
                        }
                        })
                            this.createGraphic(resultFeatures, fields.filter(field => field.alias != 'Shape'), layer.geometryType, 
                            (layer.source.layerDefinition.name ? layer.source.layerDefinition.name + '_CLIP_' + this.props.map.layers.items.length : 'CLIP_Layer_' +  this.props.map.layers.items.filter(item => item.id.includes('CLIP')).length));
                            // if(response.features.length == layer.maxRecordCount){
                            //    this.featureGet(response.features[response.features.length - 1].attributes["FID"]).then(all => {
                            //         all.forEach((feat)=>{
                            //            if(geometryEngine.intersects(feat.geometry, filterLayer)){
                            //                var intersectedGeom = geometryEngine.intersect(feat.geometry, filterLayer);
                            //                resultFeatures.push(intersectedGeom);
                            //                console.log("boom")
                            //            }
                            //        })
                            //        console.log("end")
                            //        this.createGraphic(resultFeatures, fields);
                            //    })
                            // }
                        })
            }
            var fields = layer.fields;
            var queryCros = layer.createQuery();
            queryCros.outFields = [ "*" ];
            queryCros.geometry = filterLayer;
            queryCros.returnGeometry = true;
            layer.queryFeatures(queryCros).then((result) => {
            this.createGraphic(result.features, fields.filter(field => field.alias != 'Shape'), layer.geometryType, 
            (layer.source.layerDefinition.name ? layer.source.layerDefinition.name + '_INTERSECT_' + this.props.map.layers.items.length : 'INTERSECT_Layer_' +  this.props.map.layers.items.filter(item => item.id.includes('INTERSECT')).length));
        })
    })          
    })}; 

    createGraphic(graphics, fields, geometryType, Name){
        loadModules(["esri/Graphic","esri/layers/FeatureLayer", "esri/renderers/Renderer"]).then(([Graphic, FeatureLayer, Renderer]) => {  
            if(geometryType === "point"){
                var openSpacesRenderer = {
                    "type": "simple",
                    "symbol": {
                        "color": [
                            0, 217, 255
                        ],
                        "type": "simple-marker"
                        }
                    }         
                var featureLayer = new FeatureLayer({
                    id: 'PrivateCreateLayer' + Name,
                    source: graphics,
                    fields: fields,
                    geometryType: "point",
                    outFields: ["*"],
                    renderer: openSpacesRenderer
                });
                
                this.props.map.add(featureLayer);         
                
                this.setState({showTableFlag: true})
            } 
            else if(geometryType === "polygon"){
                var openSpacesRenderer = {
                    "type": "simple",
                    "symbol": {
                        "color": [
                            0, 217, 255
                        ],
                        "outline": {
                            "width": 1
                        },
                        "type": "simple-fill",
                        "style": "solid"
                        }
                    }         
                var featureLayer = new FeatureLayer({
                    id: 'PrivateCreateLayer' + Name,
                    source: graphics,
                    fields: fields,
                    geometryType: "polygon",
                    outFields: ["*"],
                    renderer: openSpacesRenderer,
                    opacity: 0.5
                });
                this.props.map.add(featureLayer);         
                
                this.setState({showTableFlag: true})
            }
            else if(geometryType === "polyline"){
                var openSpacesRenderer = {
                    "type": "simple",
                    "symbol": {
                        "color": "lightblue",
                        "width": "2px",
                        "type": "simple-line",
                        "style": "solid"
                      }
                    }         
                var featureLayer = new FeatureLayer({
                    id: 'PrivateCreateLayer' + Name,
                    source: graphics,
                    fields: fields,
                    geometryType: "polyline",
                    outFields: ["*"],
                    renderer: openSpacesRenderer,
                });
                this.props.map.add(featureLayer);         
                
                this.setState({showTableFlag: true})
            }
           this.props.updateLayersArray();
    })}

    convertCoords(points){
        var result = loadModules(["esri/geometry/support/webMercatorUtils"]).then(([webMercatorUtils]) => { 
            var newPoints = [];
            //points.forEach(point => {var newpoint = webMercatorUtils.lngLatToXY(point[0], point[1]); newPoints.push(newpoint)});      
            points.forEach(point => {var newpoint = webMercatorUtils.xyToLngLat(point[0], point[1]); newPoints.push(newpoint)});        
            return newPoints;
        });
        return result
    }

    closeThis(){
        this.props.closeForm("firstTool");
    }
}