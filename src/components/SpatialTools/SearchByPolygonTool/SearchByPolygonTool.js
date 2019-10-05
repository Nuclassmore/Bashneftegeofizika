import React, { Component } from 'react';
import './SearchByPolygonTool.css';
import {getAllFeatures} from '../../../services/Feature.service';
import { loadModules } from '@esri/react-arcgis'
import equal from 'fast-deep-equal'
import {createFeatureLayer} from '../../../utils/Create';
var shp = require("shpjs");
var getShapeFile = require("shpjs");

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
            collapseMethod: "",
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
        this.loadShape = this.loadShape.bind(this);
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
            if(this.state.selectPolygonCollection.length > 0 && this.state.selectPolygonCollection.filter(obj => obj.data.uid === polygons[i].uid)[0]){
                var obj = this.state.selectPolygonCollection.filter(obj => obj.data.uid === polygons[i].uid)[0];
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
                       selectPolygonName: this.state.selectPolygonCollection.filter(poly => poly.id === id)[0].name,
                       selectPolygonId: id})
    }

    handleChangePolygonName(){
        var polygons = this.state.selectPolygonCollection
        polygons.filter(poly => poly.id === this.state.selectPolygonId)[0].name = this.state.selectPolygonName
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
                <h4>Анализ участка</h4>

                <div className="collapsableLabel" id="CoordsMethod" ref="CoordsMethod" onClick={this.collapsePolygonMethod}>Ввести координаты</div>
                {this.state.collapseMethod === "CoordsMethod" && <div className="collapsableBody" >
                <div className="WorkArea__AddPoint"><input value={this.state.latitude} onChange={this.handleChangeLatitude} placeholder="latitude"/><input value={this.state.longitude} onChange={this.handleChangeLongitude} placeholder="longitude"/><div className="Form__button" onClick={this.addPointToCollection}>Добавить</div></div>
                <div className="WorkArea__PointCollection"><table><thead><tr><td>latitude</td><td>longitude</td></tr></thead><tbody>{this.state.pointCollection.map((point, index) => {return <tr key={index} className="WorkArea__Point" ><td>{point.latitude}</td><td>{point.longitude}</td><td onClick={() => this.removePointFromCollection(index)}>-</td></tr>})}</tbody></table></div>
                </div>}
                
                <div className="collapsableLabel" id="MouseMethod" ref="MouseMethod" onClick={this.collapsePolygonMethod}>Нарисовать мышью</div>
                {this.state.collapseMethod === "MouseMethod" && <div className="collapsableBody">
                <div className="WorkArea__PointCollection"><table><thead><tr><td colSpan="2" >Коллекция объектов выборки</td></tr></thead><tbody>{this.state.selectPolygonCollection.length ? this.state.selectPolygonCollection.map((graphic, index) => {return <tr key={index} className="WorkArea__Point" ><td className="WorkArea__RenameText" onMouseEnter={() => this.showRenaming(graphic.id)} onMouseLeave={this.showRenaming} onClick={() => this.handleChangePolygonNameStart(graphic.id)}>{this.state.showRenaming === graphic.id ? 'Переименовать' : typeof graphic.name === 'number' ? "Выборка №" + graphic.name : graphic.name}</td><td className="WorkArea__DeleteButton" onClick={() => this.removeGraphic(index)}>Удалить</td></tr>}) : <tr className="WorkArea__Point"><td style={{'fontSize': '14px'}}>Анализируемые участки не выбраны</td></tr>}</tbody></table></div>
                </div>}

                <div className="collapsableLabel" id="LoadMethod" ref="LoadMethod" onClick={this.collapsePolygonMethod}>Загрузить из файла</div>
                {this.state.collapseMethod === "LoadMethod" && <div className="collapsableBody">
                <input style={{'padding': '0 0 10px 0'}} placeholder="Шейп файл" type="file" onChange={this.loadShape}/>
                <div className="WorkArea__PointCollection"><table><thead><tr><td colSpan="2" >Коллекция объектов выборки</td></tr></thead><tbody>{this.state.selectPolygonCollection.length ? this.state.selectPolygonCollection.map((graphic, index) => {return <tr key={index} className="WorkArea__Point" ><td className="WorkArea__RenameText" onMouseEnter={() => this.showRenaming(graphic.id)} onMouseLeave={this.showRenaming} onClick={() => this.handleChangePolygonNameStart(graphic.id)}>{this.state.showRenaming === graphic.id ? 'Переименовать' : typeof graphic.name === 'number' ? "Выборка №" + graphic.name : graphic.name}</td><td className="WorkArea__DeleteButton" onClick={() => this.removeGraphic(index)}>Удалить</td></tr>}) : <tr className="WorkArea__Point"><td style={{'fontSize': '14px'}}>Анализируемые участки не выбраны</td></tr>}</tbody></table></div>
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
                <h5>Результат:</h5>
                {this.state.resultOpenModal && <div className="ResultModalBlock">
                    <table className="ResultModal">
                            {
                                this.state.reportData.map((filterPolygonLayers, indexPolygon) =>                                        
                                    <tbody key = {'Num' + indexPolygon}>
                                        <tr>
                                            <td className="ResultModal__PolygonVariant">
                                                {typeof filterPolygonLayers.name === 'number' ? 'Выборка № ' + filterPolygonLayers.name : filterPolygonLayers.name}
                                            </td>
                                        </tr>
                                        {filterPolygonLayers.data.length > 0 && filterPolygonLayers.data.map((filterLyaer, indexLayer) => {
                                            if(filterLyaer.type === 'polyline')  { 
                                            return([
                                                <tr key= {'polyline1' + indexLayer}>
                                                    <td className="ResultModal__Clip" colSpan={3}>
                                                        Километраж профилей вырезанные анализируемым участком:
                                                    </td>
                                                </tr>,
                                                <tr key= {'polyline2' + indexLayer}>   
                                                    <td colSpan="3">
                                                        <span>Линейный слой:</span><span style={{'color': 'yellow'}}>{filterLyaer.name}</span>
                                                    </td> 
                                                </tr>,
                                                <tr key= {'polyline3' + indexLayer}>   
                                                    <td>
                                                        <span>Километраж:</span>
                                                    </td>                                               
                                                    <td colSpan="2">
                                                        <span className="ResultText__Clip">{filterLyaer.lengthSummClip}</span><span style={{'color': 'white'}}>(км)</span>
                                                    </td>
                                                </tr>,
                                                <tr key= {'polyline4' + indexLayer}>
                                                    <td className="ResultModal__Intersect" colSpan={3}>
                                                    Километраж профилей пересекающихся с анализируемым участком:
                                                    </td>
                                                </tr>,
                                                <tr key= {'polyline5' + indexLayer}>
                                                    <td colSpan="3">
                                                        <span>Линейный слой:</span><span style={{'color': 'yellow'}}>{filterLyaer.name}</span>
                                                    </td>
                                                </tr>,
                                                <tr key= {'polyline6' + indexLayer}>
                                                    <td>
                                                        <span>Километраж:</span>
                                                    </td>
                                                    <td colSpan="2">
                                                        <span className="ResultText__Intersect">{filterLyaer.lengthSummIntersect}</span><span style={{'color': 'white'}}>(км)</span>
                                                    </td>
                                                </tr>
                                                ])
                                            }
                                            else if(filterLyaer.type === 'polygon')                                                  
                                                { return [
                                                <tr key= {'polygon1' + indexLayer}>
                                                    <td className="ResultModal__Area" colSpan={3}>
                                                        Изученность участков работ:
                                                    </td>
                                                </tr>,
                                                <tr key= {'polygon2' +indexLayer}>
                                                    <td colSpan="3">
                                                        <span>Полигональный cлой:</span><span style={{'color': 'yellow'}}>{filterLyaer.name}</span>
                                                    </td>
                                                </tr>,
                                                <tr key= {'polygon3' +indexLayer}>
                                                    <td>
                                                        <span>ID объекта</span>
                                                    </td>
                                                    <td>
                                                        <span>Площадь (км2)</span>
                                                    </td>
                                                    <td>
                                                        <span>Процент</span>
                                                    </td>
                                                </tr>,
                                                    filterLyaer.areaResearchProc.map((area, indexArea) => {
                                                        return[
                                                            <tr key = {'id' + indexArea}>
                                                                <td className="ResultText__AreaId">
                                                                    <span>{area.id}</span>
                                                                </td>
                                                                <td className="ResultText__AreaDiff">
                                                                    <span>{area.reaserchArea}</span>
                                                                </td>
                                                                <td className="ResultText__AreaDiff">
                                                                    <span>{area.areaDiff}</span>
                                                                </td>
                                                            </tr>
                                                        ]}),
                                                <tr key= {'polygon4' + indexLayer}>
                                                    <td className="ResultText__AreaId">
                                                        <span style={{'color': 'white'}}>Сумма: </span>
                                                    </td>
                                                    <td className="ResultText__AreaDiff">
                                                        <span>{filterLyaer.sumResearchArea}</span>
                                                    </td>
                                                    <td className="ResultText__AreaDiff">
                                                        <span>{filterLyaer.sumProcArea}</span>
                                                    </td>
                                                </tr>                                                       
                                                ]}                                                
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
        if(event.target.id !== this.state.collapseMethod ){;
            this.setState({collapseMethod: event.target.id})
            if(this.state.collapseMethod !== ''){
                var prevElem = document.getElementById(this.state.collapseMethod);
                prevElem.classList.remove('collapsableLabelActive')
                prevElem.classList.add('collapsableLabel')
            }
            var elem = document.getElementById(event.target.id);
            elem.classList.remove('collapsableLabel')
            elem.classList.add('collapsableLabelActive')
            if(event.target.id === "MouseMethod")
                this.drawPolygon("on");
            else
                this.drawPolygon("off");
            this.setState({selectValue: "select"})
        }
    }

    addPointToCollection(){
        if(this.state.latitude !== "" && this.state.longitude !== ""){
            var collect = this.state.pointCollection;
            var point = {};
            point.latitude = this.state.latitude;
            point.longitude = this.state.longitude;
            collect.push(point)
            this.setState({pointCollection: collect, latitude: '', longitude: ''})
        }
    }

    loadShape(e){  
        var fr = new FileReader();
        fr.onload = () =>  
        {
            getShapeFile(fr.result).then((geojson) => {
                geojson.features.forEach(feature => {
                    if(feature.geometry.type === 'Polygon'){
                        this.props.drawGraphic(feature.geometry.coordinates)
                    }
                }) 
            })         
        }    
        if(e && e.target !== undefined && e.target.files.length > 0)
            fr.readAsArrayBuffer(e.target.files[0] || e.dataTransfer.files[0]);
    }
    
    removePointFromCollection(index){
        var collect = this.state.pointCollection;
        collect.splice(index, 1);
        this.setState({pointCollection: collect})
    }

    removeSelectLayer(id, flag){
        if(!flag)
            this.setState({selectedLayers: this.state.selectedLayers.filter(layer => layer !== id)})
        else
            this.setState({selectedLayers: this.state.selectedLayers.filter(layer => !layer.includes(id))})
    }

    removeGraphic(index){
        this.props.removeGraphics(index);
    }
    
    drawPolygon(flag){
        this.props.startDrawPolygon(flag);
    }        
        
    //-100.78, 32.3;-66.07, 68.45;-80.21, 25.78;-64.78, 32.3

    findFeatures(){
            var vertixes = [];            
            this.setState({reportData: [], resultOpenModal: false, resultModal: false})
            if(this.state.collapseMethod === "CoordsMethod" && this.state.pointCollection !== [] && this.state.selectedLayers.length > 0){
                this.state.pointCollection.forEach(point => {
                    var lon = parseFloat(point.longitude);
                    var lat = parseFloat(point.latitude);
                    var p = [];
                    p.push(lon);
                    p.push(lat);
                    vertixes.push(p);
                });
                if(vertixes[0] !== vertixes[vertixes.length - 1])
                    vertixes.push(vertixes[0]);
                if(vertixes !== "" && vertixes.length >= 4){
                    this.props.drawGraphic(vertixes);
                    var polygon = {
                        type: "polygon",
                        rings: [vertixes]
                    }
                    this.filterPolygonsByPolygon(polygon, 0, 'Анализ изученности участка');
                }
                else{
                    this.setState({showError: true})
                } 
            }
            else if((this.state.collapseMethod === "MouseMethod" || this.state.collapseMethod === "LoadMethod") && this.state.selectPolygonCollection.length > 0 && this.state.selectedLayers.length > 0){
                for(var i = 0; i < this.state.selectPolygonCollection.length; i++){  
                    if(this.state.selectPolygonCollection[i].data.geometry){ 
                        if(this.state.selectPolygonCollection[i].data.geometry.type === "polygon"){
                            if(this.state.collapseMethod === "LoadMethod"){
                                vertixes = this.state.selectPolygonCollection[i].data.geometry.rings;
                                var name = this.state.selectPolygonCollection[i].name
                                    var polygon = {
                                        type: "polygon",
                                        rings: vertixes
                                    }
                                    this.filterPolygonsByPolygon(polygon, i, name);
                                }
                            else{
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
                                        intersectedGeom.attributes = feat.attributes
                                        intersectedGeom.attributes['Shape__Length'] = geometryEngine.geodesicLength(intersectedGeom, "kilometers");
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
                                    this.createGraphic(graphics, fields.filter(field => field.type !== 'geometry'), layer.geometryType, 
                                    (layer.source.layerDefinition.name ? layer.source.layerDefinition.name + '_ВЫРЕЗКА_' + this.state.reportData[cicleCount].name + '-' + this.props.map.layers.items.filter(item => item.id.includes('ВЫРЕЗКА')).length : 'ВЫРЕЗКА_' +  this.state.reportData[cicleCount].name + '-' + this.props.map.layers.items.filter(item => item.id.includes('ВЫРЕЗКА')).length), 'lawngreen');
                                    // if(response.features.length === layer.maxRecordCount){
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
                    object[cicleCount].data[index] = new Object({type: '', name: '', areaResearchProc: [], sumProcArea: 0, sumResearchArea: 0});
                    this.setState({reportData: object}, () => {
                        var data = this.state.reportData;
                        data[cicleCount].data[index].name = layer.source ? layer.source.layerDefinition.name : layer.id;
                        data[cicleCount].data[index].type = "polygon"; 
                        this.setState({reportData: data})
                        
                        var resultFeatures = [];
                        var query = layer.createQuery();
                        var areaResearchProc = [];
                        var filterGeom = new Graphic({
                            geometry: filterLayer
                        });   
                        var mainArea = Math.abs(geometryEngine.geodesicArea(filterGeom.geometry, 'square-kilometers'));
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
                                        let area = Math.abs(geometryEngine.geodesicArea(intersectedGeom, 'square-kilometers'));
                                        let result = Math.abs((area / mainArea * 100)).toFixed(2);
                                        data[cicleCount].data[index].sumProcArea = data[cicleCount].data[index].sumProcArea + parseFloat(result)
                                        data[cicleCount].data[index].sumResearchArea = data[cicleCount].data[index].sumResearchArea + parseFloat(area)
                                        var oid = feat.layer.fields.filter(field => field.type === 'oid')[0].alias
                                        areaResearchProc.push({id: feat.attributes[oid], areaDiff: result, reaserchArea: area.toFixed(2)})
                                        resultFeatures.push(intersectedGeom);
                                    }
                                })
                                data[cicleCount].data[index].sumProcArea = data[cicleCount].data[index].sumProcArea.toFixed(2)
                                data[cicleCount].data[index].sumResearchArea = data[cicleCount].data[index].sumResearchArea.toFixed(2)
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
                                feat.attributes['Shape__Length'] = geometryEngine.geodesicLength(feat.geometry, 'kilometers');
                                lengthSummIntersect = lengthSummIntersect + geometryEngine.geodesicLength(feat.geometry, 'kilometers');
                            })
                            var lengthSummIntersectData = this.state.reportData;
                            lengthSummIntersectData[cicleCount].data[index].lengthSummIntersect = lengthSummIntersect.toFixed(2);
                            this.setState({reportData: lengthSummIntersectData})                        
                        }
                    if(layer.geometryType === 'polygon'){
                        result.features.forEach((feat)=>
                            {
                                feat.attributes['Shape__Area'] = geometryEngine.geodesicArea(feat.geometry, 'square-kilometers');
                                feat.attributes['Shape__Length'] = geometryEngine.geodesicLength(feat.geometry, 'kilometers');
                            })                      
                    }
                var color;
                switch(layer.geometryType){
                    case 'polyline':
                        color = 'red';
                        break;
                    case 'polygon':
                        color = [0,217,255];
                        break;
                    case 'point':
                        color = 'yellow'
                        break;
                }
                this.createGraphic(result.features, fields.filter(field => field.type !== 'geometry'), layer.geometryType, 
                (layer.source.layerDefinition.name ? layer.source.layerDefinition.name + '_ПЕРЕСЕЧЕНИЕ_' + this.state.reportData[cicleCount].name + '-' + this.props.map.layers.items.filter(item => item.id.includes('ПЕРЕСЕЧЕНИЕ')).length : 'ПЕРЕСЕЧЕНИЕ_' +  this.state.reportData[cicleCount].name + '-' + this.props.map.layers.items.filter(item => item.id.includes('ПЕРЕСЕЧЕНИЕ')).length), color)
                })
            })         
        })
    }).then(() => {this.setState({resultOpenModal: true, resultModal: true})})
    }; 

    createGraphic(graphics, fields, geometryType, Name, color){
        this.createFeatureLayer(graphics, fields, geometryType, Name, color).then((result) => {
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
                if(res.features.length === myFeatureLayer.maxRecordCount)
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
            elem.style.maxWidth = '800px';
            elem.style.height = 'auto';
            elem.style.width = '40%'
        }
        else{
            var elem = document.getElementsByClassName('WorkArea__ResultBottomLeft')[0];
            elem.style.left = 'auto';
            elem.style.width = '25%';
            elem.style.maxWidth = '400px';
            elem.style.top = 'auto';
            elem.style.height = '56px';
            elem.style.bottom= '20px';
        }
    }

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
    }
    
    newSelectPolygonName(){
        var name;
        if(this.state.selectPolygonCollection.length === 0)
            return 0
        for(var j = this.state.selectPolygonCollection.length; j > 0; j--){
            if(typeof this.state.selectPolygonCollection[j-1].name === 'number'){
                name = this.state.selectPolygonCollection[j-1].name + 1
                break;
            }
            if(j === 0)
                name =  0
                break;
        }        
        return name
    }

    closeThis(){
        this.props.closeForm("firstTool");
    }
}