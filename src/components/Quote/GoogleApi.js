
import * as moment from 'moment'
import gapi from 'gapi-client'

const apiKey = 'AIzaSyBz1UbQW1zV4R9_0q0cvJ1YsaOVoWeAJfk'

const dataBases= {
  quotes:'1RDOUDfNXJqwHD3FEnNADE432-iWhglTYWvstVJ8eARA',
  materials:'1_23xIl2RsBvH-meegHfxdHNc8jBDibmU-hieMG8L4ho',

}

export default class GoogleApi{
  constructor(){

      this.entries = []
  }

  getSheetData = async (sheet_id, range)=>{

    let values = []


    try{
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheet_id}/values/${range}?key=${apiKey}` )

      const spreadsheetdata = await response.json()
      // console.log(response, spreadsheetdata);


      let headers =[]

      for (let [index, row] of spreadsheetdata.values.entries()) {
        if (index== 0) {
          headers = row
        }else {
          if ( row.length < 1 ) continue;

          let newRow = {}
          for (let [i, header] of headers.entries()) {
            newRow[header] = row[i]
          }
          values.push(newRow)
        }
      }

    }catch(e){
      console.log('no data', e);
    }

    return values
  }


}
