import React, { Component } from 'react';
import './FeatureTableComponent.css';

export default class FeatureTableComponent extends Component {
	constructor(props){
		super(props);
		this.state = { 
            showItemsStart: 0,
            showItemsEnd: 0,
            searchInput: "",
            featuresList: [],
            filteredFeatures: []
		}
        this.closeThis = this.closeThis.bind(this);
        this.moveArrayForward= this.moveArrayForward.bind(this);
        this.moveArrayBack= this.moveArrayBack.bind(this);
        this.downLoadExcel = this.downLoadExcel.bind(this);
        this.handleChangeSearch = this.handleChangeSearch.bind(this);
    }

    
    componentWillMount() {
        this.setState({featuresList: this.props.tableShowData, filteredFeatures: this.props.tableShowData}, ()=>{
            var end = this.state.filteredFeatures.length > 200 ? 200 : this.state.filteredFeatures.length;
            this.setState({showItemsEnd: end});
        })
    }
    
    handleChangeSearch(event){
        //this.setState({searchInput: event.target.value})
        var filtered = this.state.featuresList.filter(feature => {
            return Object.keys(feature.attributes).some(item => {
                if(typeof feature.attributes[item] == 'number'){
                    if(feature.attributes[item] == event.target.value)
                        return true;
                }
                else{
                    if(feature.attributes[item].includes(event.target.value))
                        return true
                }   
            })
          })
        this.setState({filteredFeatures: filtered})
    }

    render() {
        const list = this.state.filteredFeatures.slice(this.state.showItemsStart, this.state.showItemsEnd)
        return (
        	<div className="FeatureTable__Block"> 
                <span className="Form__Close" onClick={this.closeThis}></span>
                <div className="FeatureTable__SearchBlock">
                    <input className="FeatureTable__SearchInput" placeholder="Поиск" onChange={this.handleChangeSearch}/>
                </div>
                <div className="FeatureTable__TableBlock">
                <table className="FeatureTable__Table">
                    <thead>
                        <tr>
                            {this.props.tableItemsFieldName.map(name => {return <td key={name.alias} >{name.alias}</td>})}                        
                        </tr>
                    </thead>
                    <tbody>
                    {list.map((item, index) => {return <tr key={index}>{Object.keys(item.attributes).map((keyName, index) => {return <td key={index}>{item.attributes[keyName]}</td>})}</tr>})}
                    </tbody>
                </table>   
                <div className="FeatureTable__DownloadExcel" onClick={() => this.downLoadExcel()}>Скачать таблицу</div>  
                </div>
                <div className="FeatureTable__ButtonsBlock">
                    <span className="FeatureTable__Back" style={{visibility: this.state.showItemsStart == 0 ? 'hidden' : 'visible'}} onClick={() => this.moveArrayBack()}>Назад</span>        
                    <span className="FeatureTable__Forward" style={{visibility: this.state.filteredFeatures.length > this.state.showItemsEnd ? 'visible' : 'hidden'}} onClick={() => this.moveArrayForward()}>Вперед</span>       
                </div>
            </div>
            )	
    }

    downLoadExcel(){
        var JSONData = [];        

        this.state.filteredFeatures.forEach(element => {
            Object.keys(element.attributes).forEach(item => {
                element.attributes[item] = typeof element.attributes[item] == 'number' ? element.attributes[item].toString().replace('.', ',') : element.attributes[item];
            }) 
            JSONData.push(element.attributes);
        });        

        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
        

        var CSV = 'sep=,' + '\r\n\n';

        if (true) {
            var row = "";
            
            for (var index in arrData[0]) {
                
                row += index + ',';
            }

            row = row.slice(0, -1);
            
            CSV += row + '\r\n';
        }

        for (var i = 0; i < arrData.length; i++) {
            var row = "";
            
            for (var index in arrData[i]) {
                row += '"' + arrData[i][index] + '",';
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
        
        var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
        
        var link = document.createElement("a");    
        link.href = uri;
        
        link.style = "visibility:hidden";
        link.download = fileName + ".csv";
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    moveArrayForward(){
        this.setState({showItemsEnd: this.state.filteredFeatures.length > this.state.showItemsEnd + 200 ? this.state.showItemsEnd + 200 : this.state.filteredFeatures.length})
        this.setState({showItemsStart: this.state.filteredFeatures.length > this.state.showItemsStart + 200 ? this.state.showItemsStart + 200 : 0})
    }
    
    moveArrayBack(){
        this.setState({showItemsEnd: this.state.showItemsEnd - 200 > 0 ? this.state.showItemsEnd - 200 : this.state.showItemsEnd})
        this.setState({showItemsStart: this.state.showItemsEnd - 200 > 0 ? this.state.showItemsStart - 200 : this.state.showItemsStart})
    }

    closeThis(){
        this.props.closeForm("FeatureTable");
    }
}