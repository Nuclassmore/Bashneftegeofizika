import React, { Component, forwardRef, useRef, useImperativeHandle } from 'react';
import './Map.css';
import ReactDOM from 'react-dom';
import { Map } from '@esri/react-arcgis';
import MyFeatureLayer from '../MyFeatureLayer/MyFeatureLayer';
import FeatureTableComponent from './FeatureTableComponent/FeatureTableComponent';
import LayersListComponent from './LayersListComponent/LayersListComponent';
import WorkAreasSearchByPolygonTool from '../SpatialTools/WorkAreasSearchByPolygonTool/WorkAreasSearchByPolygonTool';
import SectionSumByPolygonTool from '../SpatialTools/SectionSumByPolygonTool/SectionSumByPolygonTool';
import { loadModules } from '@esri/react-arcgis';

export default class MapContainer extends Component {
	constructor(props){
        super(props);
		this.state ={            
			map: null,
            view: null,
            viewProperties: {
                center: [-64.78, 32.3], scale: 50000000, ui: {
                    components: ["attribution"]
                  }
            },
            status: 'loading',
            showTableFlag: false,
            tableItemsData: [],
            tableItemsFieldName: [],
            filterPolygon: Object,
            showLayer: false,
            servicePath: "",
            selectionToolbar: null,
            x: 0,
            y: 0,
            startDrawing: false,
            drawPolygonPointsCollection: [],
            selectPolygonCollection: [],
            layers: [],
            graphicLayer: {}
        }
        
        this.handleMapLoad = this.handleMapLoad.bind(this);
        this.showTable = this.showTable.bind(this);
        this.closeForm = this.closeForm.bind(this);
        this.startDrawPolygon = this.startDrawPolygon.bind(this);
        this.handleChangePath = this.handleChangePath.bind(this);
        this.addService = this.addService.bind(this);
        this.toggleLayer = this.toggleLayer.bind(this);
        this.addServiceLayer = this.addServiceLayer.bind(this);
        this.startDrawPolygon = this.startDrawPolygon.bind(this);
        this.endPolygonDraw = this.endPolygonDraw.bind(this);
        this.startDrawPolygonTolltip = this.startDrawPolygonTolltip.bind(this);     
        this.removeGraphics = this.removeGraphics.bind(this);   
        this.updateLayersArray = this.updateLayersArray.bind(this);
    }  
    
    _onMouseMove(e) {
        this.setState({ y: e.screenX - 10, x: e.screenY - 10});
      }

    componentDidUpdate(){
        if(this.props.workToolId != null && this.state.view){
            this.state.view.popup.autoOpenEnabled = false;
            this.state.view.popup.close()
        }
        else if(this.state.view){
            this.state.view.popup.autoOpenEnabled = true;
        }
    }



    render() {
        return (
            <div className="Map" onMouseMove={this._onMouseMove.bind(this)}>                       
            <link rel="stylesheet" href="https://js.arcgis.com/4.11/esri/themes/light/main.css"/>
            	{this.state.status === "loading" && (<div className="load__page"><div className="logo__load"></div></div>)}
            	
                <Map mapProperties={{ basemap: 'satellite' }}
    			    	viewProperties={this.state.viewProperties} 
    			        onLoad={this.handleMapLoad} onClick={this.startDrawPolygon} onDoubleClick = {(evt)=>this.endPolygonDraw(evt)} >   
                </Map>               
                
                {this.props.workToolId === "firstTool" && <WorkAreasSearchByPolygonTool closeForm={(id) => this.closeForm(id)} map = {this.state.map} removeGraphics = {(index, method) => this.removeGraphics(index, method)} 
                selectPolygonCollection = {this.state.map.findLayerById("GraphicLayer") ? this.state.map.findLayerById("GraphicLayer").graphics.items : []} 
                startDrawPolygon={(flag)=>this.startDrawPolygonTolltip(flag)} LayersList = {this.state.layers} updateLayersArray = {this.updateLayersArray}></WorkAreasSearchByPolygonTool>}
                
                {this.props.workToolId === "attributeTable" && <FeatureTableComponent tableShowData = {this.state.tableItemsData} tableItemsFieldName = {this.state.tableItemsFieldName} closeForm={(id) => this.closeForm(id)}></FeatureTableComponent>} 
                
                {this.props.showLayersListForm && <LayersListComponent openTable = {(id) => this.showTable(id)} LayersList = {this.state.layers} toggleLayer={(layerId, flag, index) => this.toggleLayer(layerId, flag, index)}></LayersListComponent>}
                
                {/* Добавление при входе */}
                {!this.props.showLayer && this.state.status === "loaded" && <div className="AddLayer__Form"> 
                <h5>Введите адрес сервиса пространственных объектов</h5>
                <input className="Form__input" value={this.state.servicePath} onChange={this.handleChangePath} placeholder="Введите адрес"/>
                <div className="Form__Buttons__Block"><div className="Form__button" onClick={this.addService}>Добавить сервис</div></div>
                </div>}

                {/* Простое Добавление */}
                {this.props.showLayerAddForm && <div className="AddLayer__Form"> 
                <h5>Введите адрес сервиса пространственных объектов</h5>
                <input className="Form__input" value={this.state.servicePath} onChange={this.handleChangePath} placeholder="Введите адрес"/>
                <div className="Form__Buttons__Block"><div className="Form__button" onClick={this.addServiceLayer}>Добавить сервис</div></div>
                </div>}

                {/* this.state.startDrawing  && <div className="tooltip" ref="tip" style={{top: this.state.x, left: this.state.y}}>Нажмите дважды для завершения</div> */}
            </div>            
        )	    
    }      

    //линии https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Florida_Annual_Average_Daily_Traffic/FeatureServer/0
    //полигоны https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/3
    //точки https://services.arcgis.com/rOo16HdIMeOBI4Mb/arcgis/rest/services/Heritage_Trees_Portland/FeatureServer/0

    startDrawPolygonTolltip(flag){
        if(flag === "on"){
            //this.setState({startDrawing: true});
            loadModules(["esri/widgets/Sketch","esri/layers/GraphicsLayer"]).then(([Sketch, GraphicsLayer]) => {
                var graph = new GraphicsLayer({id: "GraphicLayer"});
                this.state.map.add(graph);
                const sketch = new Sketch({
                layer: graph,
                view: this.state.view
                });
        
                this.state.view.ui.add({
                    component: sketch,
                    position: "top-right"
                    });
            })
        }
        else{
            //this.setState({startDrawing: false});
            this.state.map.remove(this.state.map.findLayerById("GraphicLayer"));
            this.state.view.ui.empty("top-right");
            this.setState({selectPolygonCollection: []});
        }
    }

    toggleLayer(layerId, flag, index){
        var myFeatureLayer = this.state.map.findLayerById(layerId); 
        myFeatureLayer["visible"] = !flag;

        var items = this.state.layers;
        var item = items[index];
        item.visible = !flag;
        items[index] = item;
        this.setState({layers: items})
    }

    
    removeGraphics(index, method){
        if(method != "MouseMethod"){
            this.setState({startDrawing: false})
        }
        else{
            this.setState({startDrawing: true})
        }
        if(this.state.map.findLayerById("GraphicLayer") && this.state.map.findLayerById("GraphicLayer").graphics){
            this.state.map.findLayerById("GraphicLayer").graphics.remove(this.state.map.findLayerById("GraphicLayer").graphics.items[index]);
            console.log(this.state.map.findLayerById("GraphicLayer").graphics)
        }
    }

    addServiceLayer(){
        loadModules(["esri/layers/FeatureLayer"]).then(([FeatureLayer]) => {
                var template = {
                    // autocasts as new PopupTemplate()
                    title: "Информация по объекту",
                    content: "{*}"
                };
                const myFeatureLayer = new FeatureLayer({
                    mode: FeatureLayer.MODE_ONDEMAND,
                    id: "ServiceLayer-" + this.state.map.layers.items.length,
                    url: this.state.servicePath,
                    outFields: ["*"],
                    popupTemplate: template
                  });
                  
                this.state.map.add(myFeatureLayer);   
                var lay = this.state.layers;  
                lay.push(myFeatureLayer);
                this.setState({layers: lay, servicePath: ""})
            })
            .then(() => {this.props.toggleForm("AddServiceForm")})
            .catch((err) => console.error(err));
    }
    
    addService(){
        loadModules(["esri/layers/FeatureLayer"]).then(([FeatureLayer]) => {
            var template = {
                // autocasts as new PopupTemplate()
                title: "Информация по объекту",
                content: "{*}"
              };
            const myFeatureLayer = new FeatureLayer({
                mode: FeatureLayer.MODE_ONDEMAND,
                id: "ServiceLayer-" + this.state.map.layers.items.length,
                url: this.state.servicePath,
                outFields: ["*"],
                popupTemplate: template
              });
            
            this.state.map.add(myFeatureLayer); 
            var lay = this.state.layers;  
            lay.push(myFeatureLayer);
            this.setState({layers: lay, servicePath: ""})
        })
        .then(() => {this.showHeadersTools();
                    this.props.addFeatureLayerService()})
        .catch((err) => console.error(err));             
    }

    updateLayersArray(){
        var layers = this.state.map.layers.items;
        this.setState({layers: layers})
    }

    showHeadersTools(){
        this.props.showHeadersTools();
    }

    handleChangePath(event) {
        this.setState({servicePath: event.target.value});
    }

    handleMapLoad(map, view) {
    	this.setState({status: "loaded"});
        this.setState({ map, view });    
    }

    showTable(LayerId){  
        if(this.props.workToolId === "firstTool"){
            this.setState({startDrawing: false});
            this.startDrawPolygonTolltip('off')
        }
        var myFeatureLayer = this.state.map.findLayerById(LayerId);   
        var query = myFeatureLayer.createQuery();
        query.outFields = ["*"]
        myFeatureLayer.queryFeatures(query)
        .then((response) => {
            this.setState({tableItemsData: response.features,
                tableItemsFieldName: myFeatureLayer.fields.filter(field => field.alias != 'Shape')
            }, ()=>{
                this.props.openToolWorkForm("attributeTable")
            });         
        }).catch((err) => console.error(err));   
    }

    endPolygonDraw(evt){
        evt.stopPropagation();
        //this.setState({selectPolygonCollection: this.state.map.findLayerById("GraphicLayer").graphics.items})
        // if(this.state.startDrawing && this.state.drawPolygonPointsCollection.length > 3){
        //     this.setState({selectPolygonCollection: this.state.view.graphics.items});            
        //     this.setState({startDrawing: false});
        // }
    }

    startDrawPolygon(event){ 
        console.log(this.state.map)
        if(!this.state.startDrawing){
            
        }
        if(this.state.startDrawing)  {
            // loadModules(["esri/geometry/Point", "esri/Graphic"]).then(([Point,Graphic]) => {
            //     if(this.state.drawPolygonPointsCollection.length >= 4)
            //         this.state.drawPolygonPointsCollection.splice(this.state.drawPolygonPointsCollection.length - 1, 1)
            //     const point = new Point({ latitude: event.mapPoint.latitude, longitude: event.mapPoint.longitude});
            //     var collection = this.state.drawPolygonPointsCollection;
            //     collection.push([event.mapPoint.longitude, event.mapPoint.latitude]);
            //     this.setState({drawPolygonPointsCollection: collection})

            //     if(this.state.drawPolygonPointsCollection.length < 2){
            //         var symbol = {
            //             type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
            //             style: "circle",
            //             color: [227, 139, 79],
            //             size: "8px",  // pixels
            //             outline: {  // autocasts as new SimpleLineSymbol()
            //               color: [ 255, 255, 255],
            //               width: 2  // points
            //             }
            //           };
            //           var graphic = new Graphic({
            //             geometry: point,
            //             symbol: symbol
            //         });   
            //     }
            //     else if(this.state.drawPolygonPointsCollection.length == 2){
            //         var polyline = {
            //             type: "polyline", // autocasts as new Polyline()
            //             paths: this.state.drawPolygonPointsCollection
            //           };
            //         var lineSymbol = {
            //             type: "simple-line", // autocasts as new SimpleLineSymbol()
            //             color: [255, 255, 255], // RGB color values as an array
            //             width: 2
            //         };
            //         var graphic = new Graphic({
            //             geometry: polyline,
            //             symbol: lineSymbol
            //         });  
            //     }
            //     else{
            //         var paths = this.state.drawPolygonPointsCollection;
            //         paths.push(paths[0]);
            //         var polygon = {
            //             type: "polygon", // autocasts as new Polyline()
            //             rings: paths
            //           };
            //         const symbol = {
            //             type: "simple-fill", // autocasts as new SimpleFillSymbol()
            //             color: [227, 139, 79, 0.8],
            //             outline: { // autocasts as new SimpleLineSymbol()
            //             color: [255, 255, 255],
            //             width: 1
            //             }
            //         };
            //         var graphic = new Graphic({
            //             geometry: polygon,
            //             symbol: symbol
            //         });   
            //     }
        
            //     // Add the geometry and symbol to a new graphic
                  
            //     this.state.view.graphics.removeAll();    
            //     this.state.view.graphics.add(graphic);
                       
            // })
        }
    }

    closeForm(toolId){ 
        this.props.closeThisForm(toolId);
        if(toolId === "firstTool"){
            this.setState({startDrawing: false});
            this.startDrawPolygonTolltip('off')
        }
    }

}