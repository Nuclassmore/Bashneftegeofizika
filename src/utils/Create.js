import { loadModules } from '@esri/react-arcgis'

export function createFeatureLayer(graphics, fields, geometryType, name, color = "") {
  var featureLayer 
  var result = loadModules(["esri/Graphic","esri/layers/FeatureLayer", "esri/renderers/Renderer"]).then(([Graphic, FeatureLayer, Renderer]) => {  
        var layerColor = color === "" ? [0,217,255] : color;
        var template = {
            title: "Информация по объекту",
            content: "{*}"
          };
        if(geometryType === "point"){
            var openSpacesRenderer = {
                "type": "simple",
                "symbol": {
                    "color": layerColor,
                    "size": "4",
                    "type": "simple-marker"
                    }
                }   
            featureLayer = new FeatureLayer({
                id: 'PrivateCreateLayer' + name,
                source: graphics,
                fields: fields,
                geometryType: "point",
                outFields: ["*"],
                renderer: openSpacesRenderer,
                popupTemplate: template
            });     
            
        } 
        else if(geometryType === "polygon"){
            var openSpacesRenderer = {
                "type": "simple",
                "symbol": {
                    "color": layerColor,
                    "outline": {
                        "width": 1
                    },
                    "type": "simple-fill",
                    "style": "solid"
                    }
                }         
            featureLayer = new FeatureLayer({
                id: 'PrivateCreateLayer' + name,
                source: graphics,
                fields: fields,
                geometryType: "polygon",
                outFields: ["*"],
                renderer: openSpacesRenderer,
                opacity: 0.5,
                popupTemplate: template
            });            
        }
        else if(geometryType === "polyline"){
            var openSpacesRenderer = {
                "type": "simple",
                "symbol": {
                    "color": layerColor,
                    "size": "2",
                    "type": "simple-line",
                    "style": "solid"
                  }
                }         
            featureLayer = new FeatureLayer({
                id: 'PrivateCreateLayer' + name,
                source: graphics,
                fields: fields,
                geometryType: "polyline",
                outFields: ["*"],
                renderer: openSpacesRenderer,
                popupTemplate: template
            });                    
        }
        return featureLayer
    })
    return result
}