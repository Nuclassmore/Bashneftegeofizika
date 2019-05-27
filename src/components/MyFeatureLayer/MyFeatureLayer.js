import { Component } from 'react';
import { loadModules } from '@esri/react-arcgis';

export default class MyFeatureLayer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            myFeatureLayer: null
        };
    }

    render() {
        return null;
    }

    componentWillMount() {
        loadModules([
        "esri/layers/FeatureLayer",
        "esri/tasks/support/Query",
        "esri/tasks/QueryTask",
        "esri/Graphic", 
    "esri/widgets/Sketch", "esri/layers/GraphicsLayer"]).then(([FeatureLayer, Query, QueryTask, Graphic, Sketch, GraphicsLayer]) => {

            const myFeatureLayer = new FeatureLayer({
                mode: FeatureLayer.MODE_ONDEMAND,
                id: "mainLayer",
                url: this.props.featureLayerProperties.url,
                outFields: ["*"]
              });
              
            this.setState({ myFeatureLayer });
            this.props.map.add(myFeatureLayer);     
            //Create a polygon geometry
            // const polygon = {
            //     type: "polygon", // autocasts as new Polygon()
            //     rings: [
            //     [-80.43, 29.21],
            //     [-87.63, 29.05],
            //     [-86.68, 27.72],
            //     [-80.22, 24.80],
            //     [-80.43, 29.21]
            //     ]
            // };

            // // Create a symbol for rendering the graphic
            // const fillSymbol = {
            //     type: "simple-fill", // autocasts as new SimpleFillSymbol()
            //     color: [227, 139, 79, 0.8],
            //     outline: { // autocasts as new SimpleLineSymbol()
            //     color: [255, 255, 255],
            //     width: 1
            //     }
            // };

            // // Add the geometry and symbol to a new graphic
            // const graphic = new Graphic({
            //     geometry: polygon,
            //     symbol: fillSymbol
            // });         
            // this.setState({ graphic });
            // this.props.view.graphics.add(graphic);

        })
        .then(() => {this.props.showHeadersTools()})
        .catch((err) => console.error(err));
    }
    componentWillUnmount() {
        if(this.props.map.findLayerById("mainLayer")){
            this.props.map.remove(this.props.map.findLayerById("mainLayer"));
        }
    }    
}
