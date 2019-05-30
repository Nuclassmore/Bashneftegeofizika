import React, { Component } from 'react';
import './FeatureTableComponent.css';
import {createFeatureLayer} from '../../../utils/Create';

export default class FeatureTableComponent extends Component {
	constructor(props){
		super(props);
		this.state = { 
            showItemsStart: 0,
            showItemsEnd: 0,
            featuresList: [],
            filteredFeatures: [],
            tab: "base",
            serchValue: "",
            selectedObjects: [],
            selectedObjectsIds: [],
            filteredSelectedObjects: [],
            idField: ""
		}
        this.closeThis = this.closeThis.bind(this);
        this.moveArrayForward= this.moveArrayForward.bind(this);
        this.moveArrayBack= this.moveArrayBack.bind(this);
        this.downLoadExcel = this.downLoadExcel.bind(this);
        this.handleChangeSearch = this.handleChangeSearch.bind(this);
        this.downLoad = this.downLoad.bind(this);
        this.myXMLStyles = this.myXMLStyles.bind(this);
        this.myXMLWorkSheet = this.myXMLWorkSheet.bind(this);
        this.myXMLTable = this.myXMLTable.bind(this);
        this.myXMLColumn = this.myXMLColumn.bind(this);
        this.myXMLHead = this.myXMLHead.bind(this);
        this.myXMLRow = this.myXMLRow.bind(this);
        this.myXMLCell = this.myXMLCell.bind(this);
        this.myXMLData = this.myXMLData.bind(this);
        this.flatten = this.flatten.bind(this);
        this.changeTab = this.changeTab.bind(this);
        this.downLoadCSV = this.downLoadCSV.bind(this);
        this.handleCntrlClick = this.handleCntrlClick.bind(this);
        this.selectOnLayer = this.selectOnLayer.bind(this);
        this.createFeatureLayer = createFeatureLayer.bind(this);
    }

    
    componentWillMount() {
        var idField = this.props.tableItemsFieldName.filter(field => field.type == "oid")[0]
        this.setState({featuresList: this.props.tableShowData, filteredFeatures: this.props.tableShowData,idField: idField["alias"] }, ()=>{
            var end = this.state.filteredFeatures.length > 100 ? 100 : this.state.filteredFeatures.length;
            this.setState({showItemsEnd: end});
        })
    }
    
    handleChangeSearch(event){
        if(event.target.value == "" && this.state.tab == "base"){
            this.setState({filteredFeatures: this.state.featuresList, serchValue: ""}, () => {this.setState({showItemsStart: 0, showItemsEnd: this.state.filteredFeatures.length > 100 ? 100 : this.state.filteredFeatures.length})})
        }
        else if(event.target.value == "" && this.state.tab == "select"){
            this.setState({filteredSelectedObjects: this.state.selectedObjects, serchValue: ""}, () => {this.setState({showItemsStart: 0, showItemsEnd: this.state.filteredSelectedObjects.length > 100 ? 100 : this.state.filteredSelectedObjects.length})})
        }
        else if(this.state.tab == "base"){
            this.setState({serchValue: event.target.value});
            var filtered = this.state.featuresList.filter(feature => {
                return Object.keys(feature.attributes).some(item => {
                    if(typeof feature.attributes[item] == 'number'){
                        if(feature.attributes[item] != null && feature.attributes[item] == event.target.value)
                            return true;
                    }
                    else{
                        if(feature.attributes[item] != null && feature.attributes[item].toLowerCase().includes(event.target.value.toLowerCase()))
                            return true
                    }   
                })
              })
            this.setState({filteredFeatures: filtered}, () => {this.setState({showItemsStart: 0, showItemsEnd: this.state.filteredFeatures.length > 100 ? 100 : this.state.filteredFeatures.length})})
        }
        else if(this.state.tab == "select"){
            this.setState({serchValue: event.target.value});
            var filtered = this.state.selectedObjects.filter(feature => {
                return Object.keys(feature.attributes).some(item => {
                    if(typeof feature.attributes[item] == 'number'){
                        if(feature.attributes[item] != null && feature.attributes[item] == event.target.value)
                            return true;
                    }
                    else{
                        if(feature.attributes[item] != null && feature.attributes[item].toLowerCase().includes(event.target.value.toLowerCase()))
                            return true
                    }   
                })
              })
            this.setState({filteredSelectedObjects: filtered}, () => {this.setState({showItemsStart: 0, showItemsEnd: this.state.filteredSelectedObjects.length > 100 ? 100 : this.state.filteredSelectedObjects.length})})
        }
    }

    handleCntrlClick(event, id, item){
        event.stopPropagation();
        if(id != undefined && item)
        {
            if(event.ctrlKey && this.state.tab == "base" && !this.state.selectedObjectsIds.includes(id)) 
            {            
                this.state.selectedObjectsIds.push(id)
                this.state.selectedObjects.push(item)
                this.setState({filteredSelectedObjects: this.state.selectedObjects})
            }
            else if(this.state.selectedObjectsIds.includes(id))
            {
                var idIndex = this.state.selectedObjectsIds.indexOf(id)
                delete this.state.selectedObjectsIds[idIndex]
                var objectIndex = this.state.selectedObjects.indexOf(item)
                delete this.state.selectedObjects[objectIndex]
            }
        }
        else{
            window.alert("У данного объекта нет идентификатора")
        }
     }

    render() {
        const list = this.state.tab == "base" ? this.state.filteredFeatures.slice(this.state.showItemsStart, this.state.showItemsEnd) : this.state.filteredSelectedObjects.slice(this.state.showItemsStart, this.state.showItemsEnd)
        const listType = this.state.tab == "base" ? this.state.filteredFeatures : this.state.filteredSelectedObjects
        return (
        	<div className="FeatureTable__Block"> 
                <span className="Form__Close" onClick={this.closeThis}></span>
                <div className="FeatureTable__SearchBlock">
                    <input className="FeatureTable__SearchInput" value={this.state.serchValue} placeholder="Поиск" onChange={this.handleChangeSearch}/>
                </div>
                <div className="FeatureTable__TableBlock">
                <table className="FeatureTable__Table">
                    <thead>
                        <tr>
                            {this.props.tableItemsFieldName.map(name => {return <td key={name.alias} >{name.alias}</td>})}                        
                        </tr>
                    </thead>
                    <tbody>
                    {list.map((item, index) => {return <tr key={index} id={this.state.tab + item.attributes[this.state.idField]} style={{'background': this.state.selectedObjectsIds.filter(obj => obj == item.attributes[this.state.idField]).length > 0 && this.state.tab == 'base' ? 'rgba(255, 255, 255, 0.5)' : '' }} onClick={($event) => this.handleCntrlClick($event, item.attributes[this.state.idField], item)} >{Object.keys(item.attributes).map((keyName, index) => {return <td key={index}>{item.attributes[keyName]}</td>})}</tr>})}
                    </tbody>
                </table>   
                <div className="FeatureTable__CurrentTable" ref="base" style={{ 'background' : this.state.tab == "base" ? 'rgba(96, 102, 114, 0.6)' : '', 'boxShadow': this.state.tab == "base" ? 'inset 0 -1px 4px 1px white' : 'none'}} onClick={() => this.changeTab("base")}>Таблица</div>  
                <div className="FeatureTable__SelectTable" ref="select" style={{ 'background' : this.state.tab == "select" ? 'rgba(96, 102, 114, 0.6)' : '', 'boxShadow': this.state.tab == "select" ? 'inset 0 -1px 4px 1px white' : 'none'}} onClick={() => this.changeTab("select")}>Выбранные</div> 
                <div className="FeatureTable__BottomButton" onClick={() => this.selectOnLayer()}>Выделить на карте</div>   
                <div className="FeatureTable__BottomButton" onClick={() => this.downLoadCSV()}>Скачать таблицу</div>  
                </div>
                <div className="FeatureTable__ButtonsBlock">
                    <span className="FeatureTable__Back" style={{visibility: this.state.showItemsStart == 0 ? 'hidden' : 'visible'}} onClick={() => this.moveArrayBack()}>Назад</span>        
                    <span className="FeatureTable__Forward" style={{visibility: listType.length > this.state.showItemsEnd ? 'visible' : 'hidden'}} onClick={() => this.moveArrayForward()}>Вперед</span>       
                </div>
            </div>
            )	
    }

    moveArrayForward(){
        var list = this.state.tab == "base" ? this.state.filteredFeatures : this.state.filteredSelectedObjects
        this.setState({showItemsEnd: list.length > this.state.showItemsEnd + 100 ? this.state.showItemsEnd + 100 : list.length})
        this.setState({showItemsStart: list.length > this.state.showItemsStart + 100 ? this.state.showItemsStart + 100 : 0})
    }
    
    moveArrayBack(){
        this.setState({showItemsEnd: this.state.showItemsEnd - 100 > 0 ? this.state.showItemsEnd - 100 : this.state.showItemsEnd})
        this.setState({showItemsStart: this.state.showItemsEnd - 100 > 0 ? this.state.showItemsStart - 100 : this.state.showItemsStart})
    }

    selectOnLayer(){
        if(this.state.tab == "base"){
            this.createFeatureLayer(this.state.filteredFeatures, this.props.tableItemsFieldName.filter(field => field.alias != 'Shape'), this.props.tableGeometryType, "PrivateSelect_object", [18,212,12]).then(result => {
                this.props.map.add(result);
            })
        }
        else if(this.state.tab == "select"){
            this.createFeatureLayer(this.state.filteredSelectedObjects, this.props.tableItemsFieldName.filter(field => field.alias != 'Shape'), this.props.tableGeometryType, "PrivateSelect_object", [18,212,12]).then(result => {
                this.props.map.add(result);
            })
        }
    }

    changeTab(tabId){
        if(tabId != this.state.tab){
            this.refs[tabId].style.background = "rgba(96, 102, 114, 0.6)";
            var listType = tabId == "base" ? this.state.filteredFeatures : this.state.filteredSelectedObjects
            this.setState({tab: tabId, showItemsStart: 0, showItemsEnd: listType.length > 100 ? 100 : listType.length});
        }
    }
    
    downLoadExcel(){    
        var json = [];        

        var downloadData = this.state.tab == "base" ? this.state.featuresList : this.state.filteredFeatures

        downloadData.forEach(element => {
            Object.keys(element.attributes).forEach(item => {
                element.attributes[item] = typeof element.attributes[item] == 'number' ? element.attributes[item].toString().replace('.', ',') : element.attributes[item];
            }) 
            json.push(element.attributes);
        });

        let fs, SheetName = 'SHEET 1',
        styleID = 1;        
        
        let respArray = typeof json != 'object' ? JSON.parse(json) : json;
        let finalDataArray = [];
        
        for (let i = 0; i < respArray.length; i++) {
            finalDataArray.push(this.flatten(respArray[i]));
        }

        let s = JSON.stringify(finalDataArray);
        fs = s.replace(/&/gi, '&amp;');

        this.downLoad(SheetName, fs, styleID)
    }

    downLoad(SheetName, fs, styleID) {
        try{
            let uri, link, Workbook, WorkbookStart = '<?xml version="1.0"?><ss:Workbook  xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">';
            const WorkbookEnd = '</ss:Workbook>';
            let fileName = this.props.layerName + "_таблица_атрибутов";
            const Worksheet = this.myXMLWorkSheet(SheetName, fs);

            WorkbookStart += this.myXMLStyles(styleID);

            Workbook = WorkbookStart + Worksheet + WorkbookEnd;
            
            uri = 'data:text/xls;charset=utf-8,' + encodeURIComponent(Workbook);
            link = document.createElement("a");
            link.href = uri;
            link.style = "visibility:hidden";
            link.download = fileName + ".xls";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        catch{
            this.downLoadCSV();
        }
    }

    myXMLStyles(id){
        let Styles = '<ss:Styles><ss:Style ss:ID="' + id + '"><ss:Font ss:Bold="1"/></ss:Style></ss:Styles>';
        return Styles;
    };
    
    myXMLWorkSheet(name, o){
        const Table = this.myXMLTable(o);
        let WorksheetStart = '<ss:Worksheet ss:Name="' + name + '">';
        const WorksheetEnd = '</ss:Worksheet>';

        return WorksheetStart + Table + WorksheetEnd;
    }
    
    myXMLTable(o){
        let TableStart = '<ss:Table>';
        const TableEnd = '</ss:Table>';
        let columnWidth = 80;
        const tableData = JSON.parse(o);

        if (tableData.length > 0) {
            const columnHeader = Object.keys(tableData[0]);
            let rowData;
            for (let i = 0; i < columnHeader.length; i++) {
                TableStart += this.myXMLColumn(columnWidth);

            }
            for (let j = 0; j < tableData.length; j++) {
                rowData += this.myXMLRow(tableData[j], columnHeader);
            }
            TableStart += this.myXMLHead(1, columnHeader);
            TableStart += rowData;
        }

        return TableStart + TableEnd;
    }
    
    myXMLColumn(w){
        return '<ss:Column ss:AutoFitWidth="0" ss:Width="' + w + '"/>';
    }
    
    
    myXMLHead(id, h){
        let HeadStart = '<ss:Row ss:StyleID="' + id + '">';
        const HeadEnd = '</ss:Row>';

        for (let i = 0; i < h.length; i++) {
            const Cell = this.myXMLCell(h[i].toUpperCase());
            HeadStart += Cell;
        }

        return HeadStart + HeadEnd;
    }
    
    myXMLRow(r, h){
        let RowStart = '<ss:Row>';
        const RowEnd = '</ss:Row>';
        for (let i = 0; i < h.length; i++) {
            const Cell = this.myXMLCell(r[h[i]]);
            RowStart += Cell;
        }

        return RowStart + RowEnd;
    }
    
    myXMLCell(n){
        let CellStart = '<ss:Cell>';
        const CellEnd = '</ss:Cell>';

        const Data = this.myXMLData(n);
        CellStart += Data;

        return CellStart + CellEnd;
    }
    
    myXMLData(d){
        let DataStart, DataEnd;
        if(parseInt(d)){
            DataStart = '<ss:Data ss:Type="Number">';
            DataEnd = '</ss:Data>';
        }
        else{
            DataStart = '<ss:Data ss:Type="String">';
            DataEnd = '</ss:Data>';
        }
        return DataStart + d + DataEnd;
    }
    
    flatten(obj){
        var obj1 = JSON.parse(JSON.stringify(obj));
        const obj2 = JSON.parse(JSON.stringify(obj));
        if (typeof obj === 'object') {
            for (var k1 in obj2) {
                if (obj2.hasOwnProperty(k1)) {
                    if (typeof obj2[k1] === 'object' && obj2[k1] !== null) {
                        delete obj1[k1]
                        for (var k2 in obj2[k1]) {
                            if (obj2[k1].hasOwnProperty(k2)) {
                                obj1[k1 + '-' + k2] = obj2[k1][k2];
                            }
                        }
                    }
                }
            }
            var hasObject = false;
            for (var key in obj1) {
                if (obj1.hasOwnProperty(key)) {
                    if (typeof obj1[key] === 'object' && obj1[key] !== null) {
                        hasObject = true;
                    }
                }
            }
            if (hasObject) {
                return this.flatten(obj1);
            } else {
                return obj1;
            }
        } else {
            return obj1;
        }
    }

    downLoadCSV(){
        var JSONData = [];        

        var downloadData = this.state.tab == "base" ? this.state.featuresList : this.state.filteredFeatures

        downloadData.forEach(element => {
            Object.keys(element.attributes).forEach(item => {
                element.attributes[item] = typeof element.attributes[item] == 'number' ? element.attributes[item].toString().replace('.', ',') : element.attributes[item];
            }) 
            JSONData.push(element.attributes);
        });        

        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
        

        var CSV = '\ufeff';
        //var CSV = 'sep=,' + '\r\n\n';

        if (true) {
            var row = "";
            
            for (var index in arrData[0]) {
                
                row += index + ';';
            }

            row = row.slice(0, -1);
            
            CSV += row + '\r\n';
        }

        for (var i = 0; i < arrData.length; i++) {
            var row = "";
            
            for (var index in arrData[i]) {
                row += '"' + arrData[i][index] +'";';
            }

            row.slice(0, row.length - 1);
            
            CSV += row + '\r\n';
        }

        if (CSV == '') {        
            alert("Invalid data");
            return;
        }   
        
        var ReportTitle = "таблицы_атрибутов"
        var fileName = "Выгрузка_";        
        fileName += ReportTitle.replace(/ /g,"_");   
        
        console.log(CSV)

        var uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(CSV);
        
        var link = document.createElement("a");    
        link.href = uri;
        
        link.style = "visibility:hidden";
        link.download = fileName + ".csv";
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } 

    closeThis(){
        this.props.closeForm("FeatureTable");
    }
}