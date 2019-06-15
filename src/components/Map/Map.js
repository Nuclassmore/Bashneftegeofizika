import React, { Component, forwardRef, useRef, useImperativeHandle } from 'react';
import './Map.css';
import ReactDOM from 'react-dom';
import { Map } from '@esri/react-arcgis';
import FeatureTableComponent from './FeatureTableComponent/FeatureTableComponent';
import LayersListComponent from './LayersListComponent/LayersListComponent';
import SearchByPolygonTool from '../SpatialTools/SearchByPolygonTool/SearchByPolygonTool';
import { loadModules } from '@esri/react-arcgis';
import CircularJSON from 'circular-json';
import { resolve } from 'q';


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
            tableItemsData: [],
            tableItemsFieldName: [],
            showLayer: false,
            servicePath: "",
            selectionToolbar: null,
            x: 0,
            y: 0,
            startDrawing: false,
            showAdviceTooltip: false,
            drawPolygonPointsCollection: [],
            selectPolygonCollection: [],
            selectPolygonCollectionCount: 0,
            layers: [],
            graphicLayer: {},
            layerName: "",
            tableGeometryType: "",
            selectServiceValue: "select",
            services: [],
            serviceLayers: [],
            selectServiceLayerValue: "select",
            layerPath: ""
        }
        
        this.searchPolygonChild = React.createRef();
        this.handleMapLoad = this.handleMapLoad.bind(this);
        this.showTable = this.showTable.bind(this);
        this.closeForm = this.closeForm.bind(this);
        this.handleChangePath = this.handleChangePath.bind(this);
        this.addService = this.addService.bind(this);
        this.toggleLayer = this.toggleLayer.bind(this);
        this.addServiceLayer = this.addServiceLayer.bind(this);
        this.startDrawPolygon = this.startDrawPolygon.bind(this);
        this.endPolygonDraw = this.endPolygonDraw.bind(this);
        this.startDrawPolygonTolltip = this.startDrawPolygonTolltip.bind(this);     
        this.removeGraphics = this.removeGraphics.bind(this);   
        this.updateLayersArray = this.updateLayersArray.bind(this);
        this.removeLayer = this.removeLayer.bind(this);
        this.zoomToLayer = this.zoomToLayer.bind(this);
        this.onChangeServiceSelect = this.onChangeServiceSelect.bind(this);
        this.getServicesLayerv = this.getServicesLayer.bind(this);
        this.onChangeServiceLayerSelect = this.onChangeServiceLayerSelect.bind(this);
        this.checkService = this.checkService.bind(this);
        this.uuidv4 = this.uuidv4.bind(this);
    }  

    
    handleChangePath(event) {
        this.setState({servicePath: event.target.value, services: [], serviceLayers: []});
        if(event.target.value.includes('services'))
            this.getServices();
        else{
            this.setState({services: []})
        }
    }

    handleMapLoad(map, view) {
    	this.setState({status: "loaded"});
        this.setState({ map, view }, () => {
            if(localStorage.getItem("myLocalLayersUrlStorage"))
            {
                var urls = JSON.parse(localStorage.getItem("myLocalLayersUrlStorage"));
                if(urls.length > 0)
                    {
                        var promises = [];
                        urls.forEach(url => promises.push(this.addServiceLayer(url.url, false, url.id)))
                        Promise.all(promises).then(() => {
                            this.props.showHeadersTools();
                            this.props.addFeatureLayerService()
                        })
                    }
            }
        });    
    }
    
    onChangeServiceLayerSelect(e){
        this.setState({selectServiceLayerValue: e.target.value, layerPath: e.target.value});
    }

    onChangeServiceSelect(e){
        this.setState({selectServiceValue: e.target.value}, () => this.getServicesLayer());        
    }

    componentWillUpdate(nextPrevs, nextStates){
        if(this.state.map && this.state.map.findLayerById("GraphicLayer") && this.state.selectPolygonCollectionCount != this.state.map.findLayerById("GraphicLayer").graphics.items.length)
            this.setState({selectPolygonCollection: this.state.map.findLayerById("GraphicLayer").graphics.items, selectPolygonCollectionCount: this.state.map.findLayerById("GraphicLayer").graphics.items.length})
    }

    componentDidUpdate(prevProps, prevStates){       
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
            <div className="Map">                      
            	{this.state.status === "loading" && (<div className="load__page"><div className="logo__load"></div></div>)}
            	
                <Map mapProperties={{ basemap: 'topo' }}
    			    	viewProperties={this.state.viewProperties} 
    			        onLoad={this.handleMapLoad} onDoubleClick={(evt) => this.endPolygonDraw(evt)}>   
                </Map>               
                
                {this.props.workToolId === "firstTool" && <SearchByPolygonTool ref={this.searchPolygonChild} closeForm={(id) => this.closeForm(id)} map = {this.state.map} removeGraphics = {(index, method) => this.removeGraphics(index, method)} 
                selectPolygonCollection = {this.state.selectPolygonCollection} 
                startDrawPolygon={(flag)=>this.startDrawPolygonTolltip(flag)} LayersList = {this.state.layers} updateLayersArray = {this.updateLayersArray}></SearchByPolygonTool>}
                
                {this.props.workToolId === "attributeTable" && <FeatureTableComponent tableGeometryType = {this.state.tableGeometryType} layerName = {this.state.layerName} map = {this.state.map} tableShowData = {this.state.tableItemsData} tableItemsFieldName = {this.state.tableItemsFieldName} closeForm={(id) => this.closeForm(id)} removeLayer = {(id) => this.removeLayer(id)}></FeatureTableComponent>} 
                
                {this.props.showLayersListForm && <LayersListComponent openTable = {(id) => this.showTable(id)} removeLayer={(id) => this.removeLayer(id)} LayersList = {this.state.layers} toggleLayer={(layerId, flag, index) => this.toggleLayer(layerId, flag, index)} zoomToLayer = {(id) => this.zoomToLayer(id)} ></LayersListComponent>}

                {/* Добавление сервиса при входе */}
                {!this.props.showLayer && this.state.status === "loaded" && <div className="AddLayer__Form"> 
                <h5>Введите адрес сервиса</h5>

                <input className="Form__input" value={this.state.servicePath} onChange={this.handleChangePath} placeholder="Введите адрес"/>

                {this.state.services.length > 0 && <select value={this.state.selectServiceValue} onChange={this.onChangeServiceSelect} className="WorkArea__SelectBox">
                            <option value="select">Выбрать</option>
                            {this.state.services.map((service, index) => {return <option key={index} value={service.url}>{service.name}</option>})}
                </select>}

                {this.state.serviceLayers.length > 0 && this.state.services.length > 0 && <select value={this.state.selectServiceLayerValue} onChange={this.onChangeServiceLayerSelect} className="WorkArea__SelectBox">
                    <option value="select">Выбрать</option>
                    {this.state.serviceLayers.map((layer, index) => {return <option key={layer.id + index} value={layer.url}>{layer.name}</option>})}
                </select>}

                <div className="Form__Buttons__Block"><div className="Form__button" onClick={this.addService}>Добавить сервис</div></div>
                </div>}

                {/* Добавление сервиса */}
                {this.props.showLayerAddForm && <div className="AddLayer__Form"> 
                <span className="Form__Close" onClick={() => this.props.toggleForm("AddServiceForm")}></span>
                <h5>Введите адрес сервиса пространственных объектов</h5>

                <input className="Form__input" value={this.state.servicePath} onChange={this.handleChangePath} placeholder="Введите адрес"/>

                {this.state.services.length > 0 && <select value={this.state.selectServiceValue} onChange={this.onChangeServiceSelect} className="WorkArea__SelectBox">
                            <option value="select">Выбрать</option>
                            {this.state.services.map((service, index) => {return <option key={index} value={service.url}>{service.name}</option>})}
                </select>}

                {this.state.serviceLayers.length > 0 && this.state.services.length > 0 && <select value={this.state.selectServiceLayerValue} onChange={this.onChangeServiceLayerSelect} className="WorkArea__SelectBox">
                    <option value="select">Выбрать</option>
                    {this.state.serviceLayers.map((layer, index) => {return <option key={layer.id + index} value={layer.url}>{layer.name}</option>})}
                </select>}

                <div className="Form__Buttons__Block"><div className="Form__button" onClick={() => this.addServiceLayer()}>Добавить сервис</div></div>
                </div>}

                {this.state.showAdviceTooltip && <div className="Advice__Tooltip">Для добавления полигона в коллекцию, нажмите на карту</div>}
            </div>            
        )	    
    }      

    //линии https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Florida_Annual_Average_Daily_Traffic/FeatureServer/0
    //полигоны https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/3
    //точки https://services.arcgis.com/rOo16HdIMeOBI4Mb/arcgis/rest/services/Heritage_Trees_Portland/FeatureServer/0
    // https://services6.arcgis.com/uynOyrEMiVAb2Kao/ArcGIS/rest/services/%D0%9B%D0%B8%D1%86%D0%B5%D0%BD%D0%B7%D0%B8%D0%BE%D0%BD%D0%BD%D1%8B%D0%B9_%D1%83%D1%87%D0%B0%D1%81%D1%82%D0%BE%D0%BA/FeatureServer/0
    // https://services6.arcgis.com/uynOyrEMiVAb2Kao/ArcGIS/rest/services/%D0%A1%D0%BA%D0%B2%D0%B0%D0%B6%D0%B8%D0%BD%D1%8B/FeatureServer/0
    // https://services6.arcgis.com/uynOyrEMiVAb2Kao/ArcGIS/rest/services/%D0%9F%D1%80%D0%BE%D1%84%D0%B8%D0%BB%D0%B8/FeatureServer/0
    startDrawPolygonTolltip(flag){
        if(flag === "on"){
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
            this.setState({showAdviceTooltip: true})
        }
        else{
            this.state.map.remove(this.state.map.findLayerById("GraphicLayer"));
            this.state.view.ui.empty("top-right");
            this.setState({selectPolygonCollection: [], showAdviceTooltip: false});
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

    removeLayer(layerId){
        try{
            this.state.map.remove(this.state.map.findLayerById(layerId));
            this.updateLayersArray(null, null, null, layerId);
        }
        catch{
            window.alert("Не удалось удалить слой")
        }
    }

    zoomToLayer(id){
        var myFeatureLayer = this.state.map.findLayerById(id)
        myFeatureLayer.queryExtent().then(rws => {
            this.state.view.goTo({
                target: rws.extent,
                speedFactor: 0.1, 
                easing: "out-quint"
              })
          })
    }
    
    removeGraphics(index, method){
        if(this.state.map.findLayerById("GraphicLayer") && this.state.map.findLayerById("GraphicLayer").graphics){
            this.state.map.findLayerById("GraphicLayer").graphics.remove(this.state.map.findLayerById("GraphicLayer").graphics.items[index]);
            this.setState({selectPolygonCollection: this.state.map.findLayerById("GraphicLayer").graphics.items})
        }
    }

    getServicesLayer(){        
        loadModules(["esri/request"]).then(([esriRequest]) => {
            var options = {
                query: {
                  f: "json"
                },
                responseType: "json"
              };
            esriRequest(this.state.selectServiceValue, options).then((response) => {
                response.data.layers.forEach(lay => lay.url = this.state.selectServiceValue + '/' + lay.id)
                this.setState({serviceLayers: response.data.layers.length > 0 ? response.data.layers : []})
              });
            })
    }

    getServices(){        
        loadModules(["esri/request"]).then(([esriRequest]) => {
            var options = {
                query: {
                  f: "json"
                },
                responseType: "json"
              };
            esriRequest(this.state.servicePath, options).then((response) => {
                if(response.data.services && !response.data.services[0].url){
                    var url = this.state.servicePath.trim()[this.state.servicePath.length - 1] != '/' ? this.state.servicePath.trim() + '/' : this.state.servicePath.trim()
                    response.data.services = response.data.services.filter(serv => serv.type === "FeatureServer")
                    response.data.services.forEach((service) => service.url = url + service.name + "/" + service.type)
                }
                this.setState({services: response.data.services.length > 0 ? response.data.services : [], selectServiceLayerValue: "select", selectServiceValue: 'select'})
              });
            })
    }

    checkService(url){
        var req = loadModules(["esri/request"]).then(([esriRequest]) => {
            var options = {
                query: {
                  f: "json"
                },
                responseType: "json"
              };
            var res = esriRequest(url, options).then((response) => {
                    if(response.data.type === 'Feature Layer')
                        return true
                    else
                        window.alert("Невозможно добавить слой на карту!")
                }).then((result) => {return result}).catch(error => window.alert("Невозможно добавить слой на карту!"));
                return res
            })
        return req
    }

    addServiceLayer(url, rewrite, id){          
        if(this.state.serviceLayers.length > 0 && this.state.selectServiceLayerValue && this.state.selectServiceLayerValue != "select") {
            url = this.state.selectServiceLayerValue            
        }  
        this.checkService(url ? url : this.state.servicePath).then((res) => {
            if(res === true)
            loadModules(["esri/layers/FeatureLayer"]).then(([FeatureLayer]) => {
                var template = {
                    title: "Информация по объекту",
                    content: "{*}"
                };
                const myFeatureLayer = new FeatureLayer({
                    mode: FeatureLayer.MODE_ONDEMAND,
                    id: id ? id : 'PrivateCreateLayer' + "ServiceLayer-" + this.uuidv4(),
                    url: url ? url : this.state.servicePath,
                    outFields: ["*"],
                    popupTemplate: template
                  });
                  
                this.state.map.add(myFeatureLayer); 
                this.updateLayersArray(url ? url : this.state.servicePath, myFeatureLayer.id, rewrite)
            })
            .then(() => {if(rewrite != false)this.props.toggleForm("AddServiceForm")})
            .catch((err) => console.error(err));
        })        
    }
    
    addService(){
        this.checkService(this.state.selectServiceLayerValue != "select" ? this.state.selectServiceLayerValue : this.state.servicePath).then(res => {
            if(res === true)
            loadModules(["esri/layers/FeatureLayer"]).then(([FeatureLayer]) => {
                var template = {
                    title: "Информация по объекту",
                    content: "{*}"
                  };
                const myFeatureLayer = new FeatureLayer({
                    mode: FeatureLayer.MODE_ONDEMAND,
                    id: 'PrivateCreateLayer' + "ServiceLayer-" + this.uuidv4(),
                    url: this.state.selectServiceLayerValue != "select" ? this.state.selectServiceLayerValue : this.state.servicePath,
                    outFields: ["*"],
                    popupTemplate: template
                  });
                
                this.state.map.add(myFeatureLayer); 
                this.updateLayersArray(this.state.selectServiceLayerValue != "select" ? this.state.selectServiceLayerValue : this.state.servicePath, myFeatureLayer.id);
            })
            .then(() => {this.props.showHeadersTools();
                        this.props.addFeatureLayerService()})
            .catch((err) => console.error(err));                         
        })
    }

    updateLayersArray(url, id, rewrite, removeId){
        var layers = this.state.map.layers.items;
        this.setState({layers: layers}, () => {
            if(url || removeId)
            {
                if(!localStorage.getItem("myLocalLayersUrlStorage")){
                    var urls = []
                    localStorage.setItem("myLocalLayersUrlStorage", JSON.stringify(urls))
                }
                if(rewrite != false && !removeId){
                    var urls = JSON.parse(localStorage.getItem("myLocalLayersUrlStorage"))
                    urls = urls.concat({id: id, url: url})
                    localStorage.setItem("myLocalLayersUrlStorage", [])
                    localStorage.setItem("myLocalLayersUrlStorage", JSON.stringify(urls))
                }
                if(removeId){
                    var urls = JSON.parse(localStorage.getItem("myLocalLayersUrlStorage"))
                    urls = urls.filter(url => url.id != removeId)
                    localStorage.setItem("myLocalLayersUrlStorage", [])
                    localStorage.setItem("myLocalLayersUrlStorage", JSON.stringify(urls))
                }
            }
        })
    }

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

    showTable(LayerId){  
        this.closeForm("FeatureTable");
        this.removeLayer('PrivateCreateLayerPrivateSelect_object')
        if(this.props.workToolId === "firstTool"){
            this.startDrawPolygonTolltip('off')
        }
        var myFeatureLayer = this.state.map.findLayerById(LayerId);

        var query = myFeatureLayer.createQuery();
        query.outFields = ["*"]
        myFeatureLayer.queryFeatures(query)
        .then((response) => {                       
            this.setState({tableItemsData: response.features,
                tableItemsFieldName: myFeatureLayer.fields.filter(field => field.type != 'geometry'),
                layerName: myFeatureLayer.source && myFeatureLayer.source.layerDefinition && myFeatureLayer.source.layerDefinition.name ? myFeatureLayer.source.layerDefinition.name : myFeatureLayer.id,
                tableGeometryType: myFeatureLayer.geometryType
            }, ()=>{
                this.props.openToolWorkForm("attributeTable")
            });         
        }).catch((err) => console.error(err));   
    }

    endPolygonDraw(evt){
        evt.stopPropagation();
    }

    startDrawPolygon(event){ 
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