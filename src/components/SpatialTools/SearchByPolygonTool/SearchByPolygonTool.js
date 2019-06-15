import React, { Component } from 'react';
import './SearchByPolygonTool.css';
import {getAllFeatures} from '../../../services/Feature.service';
import { loadModules } from '@esri/react-arcgis'
import equal from 'fast-deep-equal'
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
            resultModal: false,
            reportData: [],
            lengthSummClip: 0,
            lengthSummIntersect: 0,
            allfeatures: [],
            selectedLayers: [],
            selectPolygonCollection: [],
            selectPolygonNaming: false,
            selectPolygonName: '',
            selectPolygonId: '',
            showRenaming: false

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
        this.handleChangePolygonName = this.handleChangePolygonName.bind(this);
        this.uuidv4 = this.uuidv4.bind(this);
        this.hndleChangeSelectPolygonName = this.hndleChangeSelectPolygonName.bind(this);
        this.handleChangePolygonNameStart = this.handleChangePolygonNameStart.bind(this);
        this.newSelectPolygonName = this.newSelectPolygonName.bind(this);
        this.showRenaming = this.showRenaming.bind(this);
    }

    componentDidMount(){
        //this.getAllFeatures();
    }

    forceUpdate() {
        this.forceUpdate();
    }

    componentWillReceiveProps(nextProps) {
        var polygons = nextProps.selectPolygonCollection;
        var arrOfPolygons = []
        for(var i = 0; i < polygons.length; i++){
            if(this.state.selectPolygonCollection.length > 0 && this.state.selectPolygonCollection.filter(obj => obj.data.uid == polygons[i].uid)[0]){
                var obj = this.state.selectPolygonCollection.filter(obj => obj.data.uid == polygons[i].uid)[0];
                obj.data = polygons[i]
                arrOfPolygons.push(obj);
            }
            else{
                var obj = {};
                obj.id = polygons[i].uid
                obj.name = this.newSelectPolygonName();
                obj.data = polygons[i]
                arrOfPolygons.push(obj);
            }            
        }
        this.setState({selectPolygonCollection: arrOfPolygons});  
    }

    componentWillUpdate(nextProps, nextStates){    
        if(!equal(this.state.selectedLayers.length, nextStates.selectedLayers.length))
            this.setState({showError: false})
        if(!equal(this.state.pointCollection.length, nextStates.pointCollection.length))
            this.setState({showError: false})
        if(!equal(this.props.selectPolygonCollection.length, nextProps.selectPolygonCollection.length))
            this.setState({showError: false})
    }

    onChangeSelect(e){
        if(!this.state.selectedLayers.includes(e.target.value))
            this.setState({selectValue: e.target.value.split(';')[0], selectedLayers: this.state.selectedLayers.concat(e.target.value)})
    }

    handleChangePolygonNameStart(id){
        this.setState({selectPolygonNaming: !this.state.selectPolygonNaming, 
                       selectPolygonName: this.state.selectPolygonCollection.filter(poly => poly.id == id)[0].name,
                       selectPolygonId: id})
    }

    handleChangePolygonName(){
        var polygons = this.state.selectPolygonCollection
        polygons.filter(poly => poly.id == this.state.selectPolygonId)[0].name = this.state.selectPolygonName
        this.setState({selectPolygonCollection: polygons, selectPolygonNaming: false, selectPolygonName: '', selectPolygonId: ''})
    }

    handleChangeLatitude(event) {
        this.setState({latitude: event.target.value});
    }

    handleChangeLongitude(event) {
        this.setState({longitude: event.target.value});
    }

    hndleChangeSelectPolygonName(e){
        this.setState({selectPolygonName: e.target.value})
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
                    <div className="WorkArea__PointCollection"><table><thead><tr><td colSpan="2" >Коллекция объектов выборки</td></tr></thead><tbody>{this.state.selectPolygonCollection.length ? this.state.selectPolygonCollection.map((graphic, index) => {return <tr key={index} className="WorkArea__Point" ><td className="WorkArea__RenameText" onMouseEnter={() => this.showRenaming(graphic.id)} onMouseLeave={this.showRenaming} onClick={() => this.handleChangePolygonNameStart(graphic.id)}>{this.state.showRenaming === graphic.id ? 'Переименовать' : typeof graphic.name == 'number' ? "Выборка №" + graphic.name : graphic.name}</td><td className="WorkArea__DeleteButton" onClick={() => this.removeGraphic(index)}>Удалить</td></tr>}) : <tr className="WorkArea__Point"><td style={{'fontSize': '14px'}}>Анализируемые участки не выбраны</td></tr>}</tbody></table></div>
                    </div>}

                    {this.state.selectPolygonNaming && <div className="WorkArea__PolygonRename">
                        <h5>Переименовать выборку</h5>
                        <input className="Form__input" value={this.state.selectPolygonName} onChange={this.hndleChangeSelectPolygonName}/>
                        <div className="Form__Buttons__Block"><div className="Form__button" onClick={this.handleChangePolygonName}>Сохранить</div></div>
                        </div>
                    }

                    <div className="WorkArea__ChooseLayers">
                        <div className="select__Label">Выбрать слой</div>
                        <select value={this.state.selectValue} onChange={this.onChangeSelect} className="WorkArea__SelectBox">
                            <option value="select">Выбрать</option>
                            {this.props.LayersList.map((layer, index) => { if(layer.id.includes('PrivateCreateLayer') && !layer.id.includes('PrivateSelect')) return <option key={index} value={layer.id + ";" + (layer.source && layer.source.layerDefinition && layer.source.layerDefinition.name ? layer.source.layerDefinition.name : layer.id.replace('PrivateCreateLayer', ''))}> {layer.source && layer.source.layerDefinition && layer.source.layerDefinition.name ? layer.source.layerDefinition.name : layer.id.replace('PrivateCreateLayer', '') } </option>})}
                        </select>
                        <div className="WorkArea__PointCollection"><table><thead><tr><td colSpan="2" >Коллекция анализируемых слоев</td></tr></thead><tbody>{this.state.selectedLayers.length ? this.state.selectedLayers.map((layer, index) => {return <tr key={index} className="WorkArea__Point" ><td>{layer.split(';')[1]}</td><td className="WorkArea__DeleteButton" onClick={() => this.removeSelectLayer(layer)}>Удалить</td></tr>}) : <tr className="WorkArea__Point"><td style={{'fontSize': '14px'}}>Анализируемые слои не выбраны</td></tr>}</tbody></table></div>
                    </div>
                    {this.state.showError && <span className="Error__message">Введены не корректные данные</span>}
                <div className="Form__Buttons__Block">
                    <div className="Form__button" onClick={this.findFeatures}>Поиск</div>
                </div>
                {this.state.resultModal && <div className="WorkArea__ResultBottomLeft">
                    <span className="Form__FullScreen" onClick={this.openModalCenter}></span>
                    <h5>Рузультат выполнения инструмента:</h5>
                    {this.state.resultOpenModal && <div className="ResultModalBlock">
                        <table className="ResultModal">
                                {
                                    this.state.reportData.map((filterPolygonLayers, indexPolygon) =>                                        
                                        <tbody key = {'Num' + indexPolygon}>
                                            <tr>
                                                <td className="ResultModal__PolygonVariant">
                                                    {typeof filterPolygonLayers.name == 'number' ? 'Выборка № ' + filterPolygonLayers.name : filterPolygonLayers.name}
                                                </td>
                                            </tr>
                                            {filterPolygonLayers.data.map((filterLyaer, indexLayer) => {
                                                if(filterLyaer.type === 'polyline')  { 
                                                return([
                                                    <tr key= {'polyline1' + indexLayer}>
                                                        <td className="ResultModal__Clip" colSpan={2}>
                                                            Длинна линий внутри анализируемого участка:
                                                        </td>
                                                    </tr>,
                                                    <tr key= {'polyline2' + indexLayer}>   
                                                        <td>
                                                            <span>Слой:</span><span style={{'color': 'yellow'}}>{filterLyaer.name}</span>
                                                        </td>                                                 
                                                        <td>
                                                            <span className="ResultText__Clip">{filterLyaer.lengthSummClip}</span><span style={{'color': 'white'}}>(км)</span>
                                                        </td>
                                                    </tr>,
                                                    <tr key= {'polyline3' + indexLayer}>
                                                        <td className="ResultModal__Intersect" colSpan={2}>
                                                            Длинна линий пересекающихся с анализируемым участком:
                                                        </td>
                                                    </tr>,
                                                    <tr key= {'polyline4' + indexLayer}>
                                                        <td>
                                                            <span>Слой:</span><span style={{'color': 'yellow'}}>{filterLyaer.name}</span>
                                                        </td>
                                                        <td>
                                                            <span className="ResultText__Intersect">{filterLyaer.lengthSummIntersect}</span><span style={{'color': 'white'}}>(км)</span>
                                                        </td>
                                                    </tr>
                                                    ])
                                                }
                                                else if(filterLyaer.type === 'polygon')                                                  
                                                    { return [
                                                    <tr key= {'polygon1' + indexLayer}>
                                                        <td className="ResultModal__Area" colSpan={2}>
                                                            Процент изученности площади участков:
                                                        </td>
                                                    </tr>,
                                                    <tr key= {'polygon2' +indexLayer}>
                                                        <td>
                                                            <span>Слой:</span><span style={{'color': 'yellow'}}>{filterLyaer.name}</span>
                                                        </td>
                                                    </tr>,
                                                        filterLyaer.areaResearchProc.map((area, indexArea) => {
                                                            return[
                                                                <tr key = {'id' + indexArea}>
                                                                    <td className="ResultText__AreaId">
                                                                    <span>ObjectID: </span><span>{area.id}</span>
                                                                    </td>
                                                                    <td className="ResultText__AreaDiff">
                                                                    <span>Изученность: </span><span>{area.areaDiff}%</span>
                                                                    </td>
                                                                </tr>
                                                            ]}                                                                
                                                        )]
                                                    }                                                
                                                })
                                            }                                      
                                    </tbody>                                                                                                 
                                    )
                                }
                        </table>                    
                    </div>}
                </div>}
        	</div>
            )	
        }      

    showRenaming(id){
        if(id)
            this.setState({showRenaming: id})
        else{
            this.setState({showRenaming: null})
        }
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
            this.setState({reportData: [{name: '', data: []}], resultOpenModal: false, resultModal: false})
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
            else if(this.state.collapseMethod == "MouseMethod" && this.state.selectPolygonCollection.length > 0 && this.state.selectedLayers.length > 0){
                for(var i = 0; i < this.state.selectPolygonCollection.length; i++){  
                    if(this.state.selectPolygonCollection[i].data.geometry){ 
                        if(this.state.selectPolygonCollection[i].data.geometry.type === "polygon"){
                            vertixes = this.state.selectPolygonCollection[i].data.geometry.rings[0];
                            var name = this.state.selectPolygonCollection[i].name

                            this.convertCoords(vertixes, i, name).then((result) => {
                                var polygon = {
                                    type: "polygon",
                                    rings: [result.newPoints]
                                }
                                this.filterPolygonsByPolygon(polygon, result.i, result.name);
                            })
                        }         
                        else if(this.state.selectPolygonCollection[i].data.geometry.type === "polyline"){
                            vertixes = this.state.selectPolygonCollection[i].data.geometry.paths[0];
                            var name = this.state.selectPolygonCollection[i].name

                            this.convertCoords(vertixes, i, name).then((result) => {
                                var polyline = {
                                    type: "polyline",
                                    paths: result.newPoints
                                }
                                this.filterPolygonsByPolygon(polyline, result.i, result.name);
                            })
                        }  
                        else if(this.state.selectPolygonCollection[i].data.geometry.type === "point"){
                            var name = this.state.selectPolygonCollection[i].name
                            var point = {
                                type: "point",
                                longitude: this.state.selectPolygonCollection[i].data.geometry.longitude,
                                latitude: this.state.selectPolygonCollection[i].data.geometry.latitude
                            }
                            this.filterPolygonsByPolygon(point, i, name);
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
        
    filterPolygonsByPolygon(filterLayer, cicleCount, filterLayerName){
        loadModules([
        "esri/layers/FeatureLayer","esri/symbols/SimpleFillSymbol","esri/geometry/geometryEngine", "esri/Graphic"]).then(([FeatureLayer, SimpleFillSymbol, geometryEngine, Graphic]) => {       
        var layers = [];
        this.state.selectedLayers.forEach((layer) => {
            layers.push(this.props.map.findLayerById(layer.split(';')[0]))    
        })                  
        var report = this.state.reportData;
        if(cicleCount === 0)
            report.push({name: '', data: ''})
        report[cicleCount].name = filterLayerName;
        report[cicleCount].data = [[]];
        this.setState({reportData: report}, () => {
            layers.forEach((layer, index)=>{  
                if(layer.geometryType === "polyline" && filterLayer.type === "polygon"){  
                    var object = this.state.reportData;
                    object[cicleCount].data[index] = new Object({type: '', name: '',lengthSummClip: '', lengthSummIntersect: ''});
                    this.setState({reportData: object}, () => {
                        var data = this.state.reportData;
                        data[cicleCount].data[index].name = layer.source ? layer.source.layerDefinition.name : layer.id;
                        data[cicleCount].data[index].type = "polyline";
                        this.setState({reportData: data})

                        var fields = layer.fields;
                        var resultFeatures = []
                        var lengthSummClip = 0;
                        var query = layer.createQuery();
                        query.outFields = [ "*" ];
                        query.geometry = filterLayer;
                        query.returnGeometry = true;
                        layer.queryFeatures(query)
                        .then((response) => {
                            this.setState({allfeatures: response.features});
                            response.features.forEach((feat)=>
                                {
                                    if(geometryEngine.intersects(feat.geometry, filterLayer))
                                    {
                                        var intersectedGeom = geometryEngine.intersect(feat.geometry, filterLayer);
                                        intersectedGeom.attributes = feat.attributes;
                                        lengthSummClip = lengthSummClip + geometryEngine.geodesicLength(intersectedGeom, "kilometers");
                                        resultFeatures.push(intersectedGeom);
                                    }
                                })
                                    var lengthSummClipData = this.state.reportData;
                                    lengthSummClipData[cicleCount].data[index].lengthSummClip = lengthSummClip.toFixed(2)
                                    this.setState({reportData: lengthSummClipData})
                                    var graphics = [];
                                    resultFeatures.forEach(geom => {
                                    var graphic = new Graphic({
                                        attributes: geom.attributes,
                                        geometry: geom
                                    });   
                                        graphics.push(graphic); 
                                    }) 
                                    this.createGraphic(graphics, fields.filter(field => field.type != 'geometry'), layer.geometryType, 
                                    (layer.source.layerDefinition.name ? layer.source.layerDefinition.name + '_ОТРЕЗОК_' + this.props.map.layers.items.filter(item => item.id.includes('ОТРЕЗОК')).length : 'ОТРЕЗОК_Layer_' +  this.props.map.layers.items.filter(item => item.id.includes('ОТРЕЗОК')).length), 'lawngreen');
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
                    })
                }
                else if(layer.geometryType === "polygon" && filterLayer.type === "polygon"){  
                    var object = this.state.reportData;
                    object[cicleCount].data[index] = new Object({type: '', name: '', areaResearchProc: []});
                    this.setState({reportData: object}, () => {
                        var data = this.state.reportData;
                        data[cicleCount].data[index].name = layer.source ? layer.source.layerDefinition.name : layer.id;
                        data[cicleCount].data[index].type = "polygon"; 
                        this.setState({reportData: data})
                        
                        var fields = layer.fields;
                        var resultFeatures = [];
                        var query = layer.createQuery();
                        var areaResearchProc = [];
                        var filterGeom = new Graphic({
                            geometry: filterLayer
                        });   
                        query.outFields = [ "*" ];
                        query.geometry = filterLayer;
                        query.returnGeometry = true;
                        layer.queryFeatures(query)
                        .then((response) => {
                            response.features.forEach((feat)=>
                                {
                                    if(geometryEngine.intersects(feat.geometry, filterLayer))
                                    {
                                        var intersectedGeom = geometryEngine.intersect(feat.geometry, filterLayer);
                                        intersectedGeom.attributes = feat.attributes;
                                        let area = geometryEngine.geodesicArea(intersectedGeom, 'square-kilometers');
                                        let startArea = geometryEngine.geodesicArea(feat.geometry, 'square-kilometers');
                                        let result = Math.round(area / startArea * 100);
                                        var oid = feat.layer.fields.filter(field => field.type == 'oid')[0].alias
                                        areaResearchProc.push({id: feat.attributes[oid], areaDiff: result})
                                        resultFeatures.push(intersectedGeom);
                                    }
                                })
                                var areaResearchProcData = this.state.reportData;
                                areaResearchProcData[cicleCount].data[index].areaResearchProc = areaResearchProc
                                this.setState({reportData: areaResearchProcData})
                            })
                    })
                }
                
                var fields = layer.fields;
                var queryCros = layer.createQuery();
                var lengthSummIntersect = 0;
                queryCros.outFields = [ "*" ];
                queryCros.geometry = filterLayer;
                queryCros.returnGeometry = true;
                layer.queryFeatures(queryCros).then((result) => {
                    if(layer.geometryType === 'polyline'){
                        result.features.forEach((feat)=>
                            {
                                    lengthSummIntersect = lengthSummIntersect + geometryEngine.geodesicLength(feat.geometry, 'kilometers');
                            })
                            var lengthSummIntersectData = this.state.reportData;
                            lengthSummIntersectData[cicleCount].data[index].lengthSummIntersect = lengthSummIntersect.toFixed(2);
                            this.setState({reportData: lengthSummIntersectData})                        
                        }
                    this.createGraphic(result.features, fields.filter(field => field.type != 'geometry'), layer.geometryType, 
                    (layer.source.layerDefinition.name ? layer.source.layerDefinition.name + '_ПЕРЕСЕЧЕНИЕ_' +  this.props.map.layers.items.filter(item => item.id.includes('ПЕРЕСЕЧЕНИЕ')).length : 'ПЕРЕСЕЧЕНИЕ_Layer_' +  this.props.map.layers.items.filter(item => item.id.includes('ПЕРЕСЕЧЕНИЕ')).length))
                })
            })         
        })
    }).then(() => {this.setState({resultOpenModal: true, resultModal: true})})
    }; 

    createGraphic(graphics, fields, geometryType, Name){
        this.createFeatureLayer(graphics, fields, geometryType, Name).then((result) => {
            this.props.map.add(result);
            this.props.updateLayersArray();
        })       
    }

    convertCoords(points, i, name){
        var result = loadModules(["esri/geometry/support/webMercatorUtils"]).then(([webMercatorUtils]) => { 
            var newPoints = [];
            //points.forEach(point => {var newpoint = webMercatorUtils.lngLatToXY(point[0], point[1]); newPoints.push(newpoint)});      
            points.forEach(point => {var newpoint = webMercatorUtils.xyToLngLat(point[0], point[1]); newPoints.push(newpoint)});        
            return {newPoints: newPoints, i: i, name: name};
        });
        return result;
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
            elem.style.left = '30%';
            elem.style.top = '100px';
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

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
    }
    
    newSelectPolygonName(){
        var name;
        if(this.state.selectPolygonCollection.length == 0)
            return 0
        for(var j = this.state.selectPolygonCollection.length; j > 0; j--){
            if(typeof this.state.selectPolygonCollection[j-1].name == 'number'){
                name = this.state.selectPolygonCollection[j-1].name + 1
                break;
            }
            if(j == 0)
                name =  0
                break;
        }        
        return name
    }

    closeThis(){
        this.props.closeForm("firstTool");
    }
}