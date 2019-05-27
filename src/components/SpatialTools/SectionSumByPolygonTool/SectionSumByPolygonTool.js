import React, { Component } from 'react';
import './SectionSumByPolygonTool.css';
import {getAllFeatures} from '../../../services/Feature.service';
import { loadModules } from '@esri/react-arcgis';

export default class SectionSumByPolygonTool extends Component {
	constructor(props){
		super(props);
		this.state = {
            input: "",
            showError: false,
            vertixes: [],
            highlight: null,
            showTableFlag: false,
            allfeatures: [],
            lengthSumm: null,
            showLengthSumm: false
		}
        this.getAllFeatures = getAllFeatures.bind(this);
        this.closeThis = this.closeThis.bind(this);
        this.findFeatures = this.findFeatures.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.showTable = this.showTable.bind(this);
	}

    componentDidMount(){
        //this.getAllFeatures();
    }
    
    handleChange(event) {
        this.setState({input: event.target.value});
    }
    
    render() {
        return (
            <div className="WorkArea__ToolForm"> 
                <span className="Form__Close" onClick={this.closeThis}></span>
                <h4>Укажите координаты полигона для выборки</h4>
                <input className="Form__input" value={this.state.input} onChange={this.handleChange} placeholder="11.11,22.22;33.44,55.66;77.88,99.00;11.11,22.22"/>
                {this.state.showError && <span className="Error__message">*Заполните координаты вершин полигона в правильном виде</span>}
                {this.state.showLengthSumm && <span>Сумма профилей в выбранной области равна: {this.state.lengthSumm} метров</span>}
                <div className="Form__Buttons__Block">
                <div className="Form__button" onClick={this.findFeatures}>Поиск</div>
                {this.state.showTableFlag && <div className="Form__button" onClick={this.showTable}>Таблица</div>}
                </div>
        	</div>
            )	
        }
        
        //-80.43, 29.21;-87.63, 29.05;-86.68, 27.72;-80.22, 24.80;-80.43, 29.21
        findFeatures(){
            var vertixes = this.state.input.replace(/ /g, '');
            var splitedVert = [];
            vertixes.split(';').forEach(item => splitedVert.push(item.split(',')));   
            this.setState({vertixes: splitedVert}, () => {
                if(this.state.input !== "" && this.state.vertixes.length >= 4){
                    this.convertCoords(this.state.vertixes).then((result) => {
                        var polygon = {
                            type: "polygon",
                            rings: [result]
                        }
                        this.filterPolygonsByPolygon(polygon);
                        })
                    }
                })
            }
            
        filterPolygonsByPolygon(intersectGeom){
            loadModules(["esri/layers/FeatureLayer","esri/symbols/SimpleFillSymbol","esri/geometry/geometryEngine"]).then(([FeatureLayer, SimpleFillSymbol,geometryEngine]) => {
                var myFeatureLayer = this.props.map.findLayerById("mainLayer");   
                var fields = myFeatureLayer.fields;
                var resultFeatures = [];
                var query = myFeatureLayer.createQuery();
                myFeatureLayer.queryFeatures(query)
                .then((response) => {
                    this.setState({allfeatures: response.features});

                    response.features.forEach((feat)=>{
                        if(geometryEngine.intersects(feat.geometry, intersectGeom)){
                            var intersectedGeom = geometryEngine.intersect(feat.geometry, intersectGeom);
                            intersectedGeom.attributes = feat.attributes;
                            this.state.lengthSumm = this.state.lengthSumm + geometryEngine.geodesicLength(intersectedGeom, "meters");
                            resultFeatures.push(intersectedGeom);
                        }
                    })
                    this.createGraphic(resultFeatures, fields);
                    // if(response.features.length == myFeatureLayer.maxRecordCount){
                    //    this.featureGet(response.features[response.features.length - 1].attributes["FID"]).then(all => {
                    //         all.forEach((feat)=>{
                    //            if(geometryEngine.intersects(feat.geometry, intersectGeom)){
                    //                var intersectedGeom = geometryEngine.intersect(feat.geometry, intersectGeom);
                    //                resultFeatures.push(intersectedGeom);
                    //                console.log("boom")
                    //            }
                    //        })
                    //        console.log("end")
                    //        this.createGraphic(resultFeatures, fields);
                    //    })
                    // }
                })
        })};
        
        createGraphic(geometry, fields){
            if(this.props.map.findLayerById("intersectProfilesLayer")){
                this.props.map.remove(this.props.map.findLayerById("intersectProfilesLayer"));
            }
            loadModules(["esri/Graphic","esri/layers/FeatureLayer", "esri/renderers/Renderer"]).then(([Graphic, FeatureLayer, Renderer]) => {   
                var openSpacesRenderer = {
                    "type": "simple",
                    "symbol": {
                        "color": "lightblue",
                        "width": "1px",
                        "type": "simple-line",
                        "style": "solid"
                      }
                  }     
                  var graphics = [];
                  geometry.forEach(geom => {
                    var graphic = new Graphic({
                        attributes: geom.attributes,
                        geometry: geom
                    });   
                        graphics.push(graphic); 
                    })   
                var featureLayer = new FeatureLayer({
                    id: "intersectProfilesLayer",
                    source: graphics,
                    fields: fields,
                    outFields: ["*"],
                    renderer: openSpacesRenderer
                });
                this.setState({showLengthSumm: true});
                this.props.map.add(featureLayer);  
                this.setState({showTableFlag: true})
        })}

        showTable(){
        this.props.showTable("intersectProfilesLayer");
    }

    convertCoords(points){
        var result = loadModules(["esri/geometry/support/webMercatorUtils"]).then(([webMercatorUtils]) => { 
            var newPoints = [];
            points.forEach(point => {var newpoint = webMercatorUtils.lngLatToXY(point[0], point[1]); newPoints.push(newpoint)});            
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
    
    closeThis(){
        this.props.closeForm("secondTool");
    }
}