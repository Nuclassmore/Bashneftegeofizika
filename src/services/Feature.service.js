export function getAllFeatures() {
    return fetch('https://localhost:44356/api/feature/GetAllFeatures')
      .then((response) => response.text())
      .then((responseJson) => {

        this.setState({
          data: responseJson,
        }, function(){

        });

      })
      .catch((error) =>{
        console.error(error);
      });
    }