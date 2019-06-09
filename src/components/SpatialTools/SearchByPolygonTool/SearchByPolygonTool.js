import React, { Component } from 'react';
import './SearchByPolygonTool.css';
import {getAllFeatures} from '../../../services/Feature.service';
import { loadModules } from '@esri/react-arcgis'
import {createFeatureLayer} from '../../../utils/Create';


export default class SearchByPolygonTool extends Component {
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
            selectValue: "select",
            resultOpenModal: true,
            lengthSummClip: 0,
            lengthSummIntersect: 0,
            allfeatures: [],
            selectedLayers: []
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
        this.openModalCenter = this.openModalCenter.bind(this);
        this.featureGet = this.featureGet.bind(this);
        this.createFeatureLayer = createFeatureLayer.bind(this);
        this.removeSelectLayer = this.removeSelectLayer.bind(this);
    }

    componentDidMount(){
        //this.getAllFeatures();
    }

    onChangeSelect(e){
        if(!this.state.selectedLayers.includes(e.target.value))
            this.setState({selectValue: e.target.value.split(';')[0], selectedLayers: this.state.selectedLayers.concat(e.target.value)})
    }

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
                            {this.props.LayersList.map((layer, index) => { if(layer.id.includes('PrivateCreateLayer') && !layer.id.includes('PrivateSelect')) return <option key={index} value={layer.id + ";" + (layer.source && layer.source.layerDefinition && layer.source.layerDefinition.name ? layer.source.layerDefinition.name : layer.id.replace('PrivateCreateLayer', ''))}> {layer.source && layer.source.layerDefinition && layer.source.layerDefinition.name ? layer.source.layerDefinition.name : layer.id.replace('PrivateCreateLayer', '') } </option>})}
                        </select>
                        <div className="WorkArea__ChooseLayersTable"><table><tbody>{this.state.selectedLayers.length ? this.state.selectedLayers.map((layer, index) => {return <tr key={layer.split(';')[0] + index} ><td style={{fontSize: 18 + 'px', display: 'inline'}}>{layer.split(';')[1]}</td><td style={{display: 'table-cell'}}><div className="Form__button" onClick={()=>this.removeSelectLayer(layer)}>Удалить</div></td></tr>}) : <tr className="WorkArea__backtext"><td></td></tr> }</tbody></table></div>
                    </div>
                    {this.state.showError && <span className="Error__message">*Введены не корректные данные</span>}
                <div className="Form__Buttons__Block">
                    <div className="Form__button" onClick={this.findFeatures}>Поиск</div>
                </div>
                {(this.state.lengthSummClip != 0 || this.state.lengthSummIntersect != 0) && <div className="WorkArea__ResultBottomLeft">
                    <span className="Form__FullScreen" onClick={this.openModalCenter}></span>
                    <h5>Рузультат выполнения инструмента:</h5>
                    {this.state.resultOpenModal && <div>
                        <span>Сумма профилей внутри полигона:<br></br> <span className="ResultText__Clip">{this.state.lengthSummClip}</span> метров </span>       
                        <span>Сумма профилей пересекающихся с полигоном:<br></br> <span className="ResultText__Intersect">{this.state.lengthSummIntersect}</span> метров </span>                     
                    </div>}
                </div>}
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

    removeSelectLayer(id){
        this.setState({selectedLayers: this.state.selectedLayers.filter(layer => layer != id)})
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
                                    rings: [result]
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
        }
        
    filterPolygonsByPolygon(filterLayer){
        loadModules([
        "esri/layers/FeatureLayer","esri/symbols/SimpleFillSymbol","esri/geometry/geometryEngine", "esri/Graphic"]).then(([FeatureLayer, SimpleFillSymbol, geometryEngine, Graphic]) => {       
        var layers = [];
        this.state.selectedLayers.forEach(layer => {
            layers.push(this.props.map.findLayerById(layer.split(';')[0]))    
        })            
        layers.forEach((layer)=>{  
            if(layer.geometryType === "polyline" && filterLayer.type === "polygon"){  
                var fields = layer.fields;
                var resultFeatures = [];
                var query = layer.createQuery();
                query.outFields = [ "*" ];
                query.geometry = filterLayer;
                query.returnGeometry = true;
                layer.queryFeatures(query)
                .then((response) => {
                    this.setState({allfeatures: response.features});
                    this.setState({lengthSummClip: 0, lengthSummIntersect: 0, resultOpenModal: true})
                    response.features.forEach((feat)=>
                        {
                            if(geometryEngine.intersects(feat.geometry, filterLayer))
                            {
                                var intersectedGeom = geometryEngine.intersect(feat.geometry, filterLayer);
                                intersectedGeom.attributes = feat.attributes;
                                this.state.lengthSummClip = this.state.lengthSummClip + geometryEngine.geodesicLength(intersectedGeom, "meters");
                                resultFeatures.push(intersectedGeom);
                            }
                        })
                            var graphics = [];
                            resultFeatures.forEach(geom => {
                            var graphic = new Graphic({
                                attributes: geom.attributes,
                                geometry: geom
                            });   
                                graphics.push(graphic); 
                            }) 
                            this.createGraphic(graphics, fields.filter(field => field.type != 'geometry'), layer.geometryType, 
                            (layer.source.layerDefinition.name ? layer.source.layerDefinition.name + '_CLIP_' + this.props.map.layers.items.filter(item => item.id.includes('CLIP')).length : 'CLIP_Layer_' +  this.props.map.layers.items.filter(item => item.id.includes('CLIP')).length), 'lawngreen');
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
                if(layer.geometryType === 'polyline'){
                    result.features.forEach((feat)=>
                        {
                                this.state.lengthSummIntersect = this.state.lengthSummIntersect + geometryEngine.geodesicLength(feat.geometry, "meters");
                        })
                    }
                this.createGraphic(result.features, fields.filter(field => field.type != 'geometry'), layer.geometryType, 
                (layer.source.layerDefinition.name ? layer.source.layerDefinition.name + '_INTERSECT_' +  this.props.map.layers.items.filter(item => item.id.includes('INTERSECT')).length : 'INTERSECT_Layer_' +  this.props.map.layers.items.filter(item => item.id.includes('INTERSECT')).length))
        })
    })          
    })}; 

    createGraphic(graphics, fields, geometryType, Name){
        this.createFeatureLayer(graphics, fields, geometryType, Name).then((result) => {
            this.props.map.add(result);
            this.props.updateLayersArray();
        })        
    }

    convertCoords(points){
        var result = loadModules(["esri/geometry/support/webMercatorUtils"]).then(([webMercatorUtils]) => { 
            var newPoints = [];
            //points.forEach(point => {var newpoint = webMercatorUtils.lngLatToXY(point[0], point[1]); newPoints.push(newpoint)});      
            points.forEach(point => {var newpoint = webMercatorUtils.xyToLngLat(point[0], point[1]); newPoints.push(newpoint)});        
            return newPoints;
        });
        return result
    }

    featureGet(fid){
        var myFeatureLayer = this.props.map.findLayerById("mainLayer"); 
        var query1 = myFeatureLayer.createQuery();
        query1.where = "FID > " + fid;
        var all = myFeatureLayer.queryFeatures(query1).then((res) => {
                this.state.allfeatures = this.state.allfeatures.concat(res.features); 
                if(res.features.length == myFeatureLayer.maxRecordCount)
                    return this.featureGet(res.features[res.features.length - 1].attributes["FID"])
                else{
                    return this.state.allfeatures;
                }                    
            })
        return all
    }

    openModalCenter(){
        var state = !this.state.resultOpenModal;
        this.setState({resultOpenModal: state});
        if(state){
            var elem = document.getElementsByClassName('WorkArea__ResultBottomLeft')[0];
            elem.style.left = 'calc(50% - 200px)';
            elem.style.top = '25%';
            elem.style.height = 'auto';
        }
        else{
            var elem = document.getElementsByClassName('WorkArea__ResultBottomLeft')[0];
            elem.style.left = 'auto';
            elem.style.top = 'auto';
            elem.style.height = '56px';
            elem.style.bottom= '20px';
        }
    }

    closeThis(){
        this.props.closeForm("firstTool");
    }
}