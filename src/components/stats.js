import React from 'react';
import {compose} from 'recompose'
import { FirebaseContext, withFirebase } from './Firebase';
import { withAuthorization } from './Session';
import { AuthUserContext } from './Session';

import { Container, Header, Image, Table, Divider, Select, Button, Confirm } from 'semantic-ui-react'

import { Checkbox } from 'semantic-ui-react'
import { Input, Menu } from 'semantic-ui-react'
import Papa from 'papaparse'

import cloneDeep from 'lodash/cloneDeep.js'

import {PivotTable} from './pivottable.js'

import * as moment from 'moment-timezone'

function round(float, digits){
  if (digits < 0) {
    return float
  }
  return Math.round(float * 10**digits ) / 10**digits
}


class MyFileInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      file:null,
      confirmOpen:false
    };

    this.loadFileContents = this.loadFileContents.bind(this)
  }

  render() {
    return (
        <div>
          <input type='file' value={this.state.inputValue} onChange={ evt => this.updateInputValue(evt)}/>
          <Button onClick={ ()=>{ this.setState( {confirmOpen:true} )} }>Load</Button>
          <Confirm
            content={'you are about to upload a large amount of data with the risk of damaging the database integrity. Are you sure?'}
            open={this.state.confirmOpen}
            onCancel={ ()=>{this.setState( {confirmOpen:false} )} }
            onConfirm={ this.loadFileContents }
            />
        </div>
    );
  }

  convertAndUpload(text){
    const csv = Papa.parse(text);

    let newLog = {}
    for (let [i, line] of csv.data.entries()) {

      const command = line[0]
      const date = line[1]
      const time = line[2]
      const dateTime = date + ', ' + time

      var dt_temp = moment(dateTime, "DD/MM/YYYY, hh:mm:ss");
      var dt = moment(dt_temp).format('YYMMDD-HHmmss')

      var timeStamp = moment(dateTime, "DD-MM-YYYY, hh:mm:ss").unix();

      if ( dt && command) {
        newLog[`${dt}-${command}`] = {
          command:command,
          date:date,
          time:time,
          number:line[3]||'',
          filename:line[4]||'',
          countTotal:line[5]||'',
          count:line[6]||'',
          timeStamp:timeStamp
        };
      }
    }
    this.props.firebase.db.ref('biesseLogs/').set(newLog);
  }


  loadFileContents(){

    // close confirm
    this.setState({ confirmOpen: false })

    var reader = new FileReader();
     reader.onload = (e) => {
       // Entire file
       // By lines
       var lines = e.target.result.split('\n');

       this.convertAndUpload(e.target.result)
     };

     if (this.state.file) {
       reader.readAsText(this.state.file);
     }else{
       alert('no file selected')
     }

     this.setState({file:null})


  }

  updateInputValue(evt) {
    this.setState({
      inputValue: evt.target.value,
      file:evt.target.files[0]
    });


  }
};




function createCommandList(csv, context){
  let tableState = []
  let previousStart = null

  let skippedLines = 0

  let newLog = {}


  for (let [i, line] of csv.data.entries()) {

    const command = line[0]
    const date = line[1]
    const time = line[2]
    const filename = line[4]

    const dateTime = date + ', ' + time

    var timeStamp = moment(dateTime, "DD/MM/YYYY, hh:mm:ss");

    var dt = moment(timeStamp).format('YYMMDD-HHmmss')

    if ( dt && command) {
      newLog[`${dt}-${command}`] = {
        command:command,
        date:date,
      };
    }



      if (  (command === 'STOP' || command === 'EXE') && previousStart ){
        // if (previousStart.filename === filename ) {

          let duration = ( timeStamp - previousStart.timeStamp ) / 1000 / 60;

          // let project = filename.match(/TNM(\s|-|_)?\d+/g);
          let project = filename.split("/")[0];
          let material = filename.split("/").pop().split("_")[3];
          let repair = /repair|Repair|!R_/.test(filename)? 'repair' : 'production';
          repair = /Aanslag|aanslag/.test(filename)? 'aanslag' : repair;


          let entry = {
            date:moment(previousStart.date, "DD-MM-YYYY").format("YYYY-MM-DD"),
            starttime:previousStart.time,
            stoptime:time,
            filename:filename,
            duration:round( duration, 2),
            project:project,
            material:material,
            repair:repair
          }
          tableState.push( entry )

          // make sure stop is not count twice after start
          previousStart = null
        // }else{
        //   console.log('skip', line);
        //   skippedLines++
        // }
      }

      if (command === 'START') {
          previousStart = {filename: filename, date:date, time:time, timeStamp:timeStamp}
      }
  }

  // context.props.firebase.db.ref('/logs').set(newLog);


  console.log('skipped lines: ', skippedLines);

  return tableState
}


function parseLog(logsObject){

  let previousStart = {}

  let extraTable = [['project', 'date', 'week', 'month', 'filename', 'duration [min]', 'duration [h]', 'material', 'type']]

  let n = 0

  for (let [k,entry] of Object.entries(logsObject)) {

    // console.log(k);
    n++

    const {command, date, time, timeStamp, filename, countTotal, count} = entry

    if (filename == "") {
      continue
    }

    if (  (command === 'STOP' || command === 'EXE') ){

      if (previousStart[filename] && parseInt(count) == parseInt(previousStart[filename].count ) +1 ) {

        if (previousStart[filename].date != entry.date) {
          console.log('WARNING, file milled on two dates', previousStart[filename], entry);
          continue
        }

        let duration = ( timeStamp - previousStart[filename].timeStamp ) / 60;

        if (duration < 0) {
            console.log('WARNING, inverted date found', previousStart[filename], entry);
        }


        // let project = filename.match(/TNM(\s|-|_)?\d+/g);
        let project = filename.split("/")[0];
        let material = filename.split("/").pop().split("_")[3];
        let repair = /repair|Repair|!R_/.test(filename)? 'repair' : 'production';
        repair = /Aanslag|aanslag/.test(filename)? 'aanslag' : repair;

        let startDate = previousStart[filename].date

        let newEntry = [
          project,
          startDate,
          moment(startDate, "DD/MM/YYYY").isoWeek(),
          moment(startDate, "DD/MM/YYYY").month(),
          filename,
          round( duration, 2),
          round( duration/60, 2),
          material,
          repair
        ]
        extraTable.push( newEntry )
        previousStart[filename] = null
        // make sure stop is not count twice after start
        // previousStart = null
      // }else{
      //   console.log('skip', line);
      //   skippedLines++
      // }
      }
    }

    if (command === 'START') {
      if(!previousStart[filename] ){
        // only save:
        //   the first start of a specific filename
        //   the a new count
        previousStart[filename] = cloneDeep(entry)
      }
    }
  }
  // console.log(extraTable);

  return extraTable
}

class Stats extends React.Component{
  constructor(){
      super()

      this.state= {
        tableState:[],
        isLoaded:false,
        files:[],
        file:null,
        activeModus:'Overview',
      }
  }

  componentDidMount(){

    var startDate = moment.tz("Europe/Amsterdam").subtract(1, 'month').unix();
    var endDate = moment.tz("Europe/Amsterdam").unix();

    console.log(startDate, endDate);

    // var startDate = 1569593332 - 3600*24*14;
    // var endDate = 1569593332;


    var ref = this.props.firebase.db.ref("biesseLogs");
    ref.orderByChild('timeStamp').startAt(startDate).endAt(endDate).on("value", (snapshot)=> {
    // this.props.firebase.db.ref('biesseLogs/').on('value', snapshot => {

      let logsObject = snapshot.val();

      if (logsObject) {

        let table = parseLog(logsObject)



        this.setState({
          tableState:table,
          isLoaded:true
        })
      }
    });


    //
    // this.props.firebase.db.ref('biesseLogs/').orderByChild("timeStamp").startAt(startDate).endAt(endDate)
    //   .on("value", (snapshot)=>{
    //     console.log("got the data!", snapshot);
    //   });




    // this.fetchAsync()

  }

  componentWillUnmount(){
    this.props.firebase.db.ref('biesseLogs/').off()
  }



  render(){

    const {files} = this.state.files
    return (
      <Container>
        {this.state.file?
          <Header as='h2'>
            <Header.Content>
              {this.state.file.filename}
              <Header.Subheader>creation_date: {this.state.file.creation_date}</Header.Subheader>
            </Header.Content>
          </Header>:null
        }




        <Divider hidden></Divider>
        <Divider hidden></Divider>

        {!this.state.isLoaded?
          <div>Loading...</div>
          :
          <div>
            {this.state.activeModus === 'Overview'?
              <PivotTable data={this.state.tableState}/>
              :
              <Table basic='very' celled selectable collapsing>
                 <Table.Header>
                   <Table.Row>
                     <Table.HeaderCell>Date</Table.HeaderCell>
                     <Table.HeaderCell>project</Table.HeaderCell>
                     <Table.HeaderCell>filename</Table.HeaderCell>
                     <Table.HeaderCell>
                        duration
                        <p>[min]</p>
                      </Table.HeaderCell>
                     <Table.HeaderCell>export</Table.HeaderCell>
                   </Table.Row>
                 </Table.Header>

                 <Table.Body>
                   {this.state.tableState.map((item,i) =>(
                     <Table.Row key={i}>
                       <Table.Cell>
                         <Header as='h4' image>
                           <Header.Content>
                             {item.date}
                             <Header.Subheader>{item.starttime} - {item.stoptime}</Header.Subheader>
                           </Header.Content>
                         </Header>
                       </Table.Cell>
                       <Table.Cell>{item.project}</Table.Cell>
                       <Table.Cell>{item.filename}</Table.Cell>
                       <Table.Cell>{round(item.duration, 2)}</Table.Cell>
                       <Table.Cell><Checkbox /></Table.Cell>
                     </Table.Row>
                   ))}
                 </Table.Body>
               </Table>
             }
          </div>
        }

        <Divider hidden></Divider>
        <h2>upload new logfiles</h2>
        <FirebaseContext.Consumer>
          {firebase => <MyFileInput firebase={firebase}/>}
        </FirebaseContext.Consumer>

        <Divider hidden></Divider>

      </Container>
    )
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
  withFirebase,
)(Stats);
