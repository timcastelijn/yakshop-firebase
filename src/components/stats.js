import React from 'react';
import { Container, Header, Image, Table, Divider } from 'semantic-ui-react'

import { Checkbox } from 'semantic-ui-react'
import { Input, Menu } from 'semantic-ui-react'
import Papa from 'papaparse'

import {PivotTable} from './pivottable.js'


import * as moment from 'moment'

function round(float, digits){
  if (digits < 0) {
    return float
  }
  return Math.round(float * 10**digits ) / 10**digits
}

class NavBar extends React.Component{

  constructor(props){
    super(props);
  }

  state = { activeItem: 'Overview' }

  handleItemClick = (e, { name }) => {

    this.setState({ activeItem: name })

    this.props.handleChange(name)
  }


  render(){
    const { activeItem } = this.state

    return (
      <Menu secondary>
        <Menu.Item
          name='List'
          active={activeItem === 'List'}
          onClick={this.handleItemClick}
        />
        <Menu.Item
          name='Overview'
          active={activeItem === 'Overview'}
          onClick={this.handleItemClick}
        />
      </Menu>
    )
  }

}

function createCommandList(csv){
  let tableState = []
  let previousStart = null

  let skippedLines = 0

  for (let [i, line] of csv.data.entries()) {
    const command = line[0]
    const date = line[1]
    const time = line[2]
    const filename = line[4]

    const dateTime = date + ', ' + time


    var timeStamp = moment(dateTime, "DD-MM-YYYY, hh:mm:ss");


      if (  command === 'STOP' || command === 'EXE'){
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
        // }else{
        //   console.log('skip', line);
        //   skippedLines++
        // }
      }

      if (command === 'START') {
          previousStart = {filename: filename, date:date, time:time, timeStamp:timeStamp}
      }
  }

  console.log('skipped lines: ', skippedLines);

  return tableState
}


export class Stats extends React.Component{
  constructor(){
      super()

      this.state= {
        tableState:[],
        isLoaded:false,
        file:null,
        activeModus:'Overview',
      }
  }

  componentDidMount(){

    this.fetchAsync()

  }



  async fetchAsync(){

    const filename = '../logfiles/ma 23-09-2019_prod.log'

    const response = await fetch(filename);
    const text = await response.text();

    const creation_date = response.headers.get('Date');

    this.setState({file:{filename:filename, creation_date:creation_date}})

    const csv = Papa.parse(text);

    console.log('CSV', csv);

    let table = createCommandList(csv)

    if (this.state.activeModus === 'List'){
      this.setState({tableState:table, isLoaded:true})

    }else {
      let extraTable = [['project', 'date', 'week', 'month', 'filename', 'duration [min]', 'duration [h]', 'material', 'type']]
      for (let item of table) {
        let week = moment(item.date, "YYYY-MM-DD").isoWeek();
        let month = moment(item.date, "YYYY-MM-DD").month();
        extraTable.push( [item.project, item.date, week, month, item.filename, item.duration, item.duration/60, item.material, item.repair] )
      }

      this.setState({tableState:extraTable, isLoaded:true})
    }

  }

  handleModusChange = (modus)=>{


    this.setState({ activeModus: modus })

    this.setState({tableState:[], isLoaded:false})
    this.fetchAsync()
  }
  onFileChangeHandler=event=>{

      console.log(event.target.files[0])
      this.setState({
        selectedFile: event.target.files[0],
        loaded: 0,
      })

  }

  onFileClickHandler = () => {
    const data = new FormData()
    data.append('file', this.state.selectedFile)
  }

  render(){
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
        <Input type="file" name="file" onChange={this.onFileChangeHandler}></Input>
        <button type="button" className="btn btn-success btn-block" onClick={this.onFileClickHandler}>Upload</button>
        <Divider hidden></Divider>
        <NavBar handleChange={this.handleModusChange}></NavBar>
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

      </Container>
    )
  }
}
