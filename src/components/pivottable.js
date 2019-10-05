

import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Menu, Divider, Form, Button } from 'semantic-ui-react'

import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';


import TableRenderers from 'react-pivottable/TableRenderers';
// import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';

// see documentation for supported input formats

class NavBar extends React.Component{

  constructor(props){
    super(props);
  }

  state = { activeItem: 'Overview' }

  handleItemClick = (e, { name }) => {

    this.setState({ activeItem: name })

    this.props.handler(name)
  }


  render(){
    const { activeItem } = this.state

    return (
      <Menu secondary>
        <Menu.Item
          name='Minutes'
          active={activeItem === 'Minutes'}
          onClick={this.handleItemClick}
        />
        <Menu.Item
          name='Plates'
          active={activeItem === 'Plates'}
          onClick={this.handleItemClick}
        />
      </Menu>
    )
  }

}

export class PivotTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          data:props.data,
          modus:'minutes'
        };

    }

    componentDidMount(){
        // this.setState(this.props)
    }

    componentDidUpdate(prevProps) {
      // Typical usage (don't forget to compare props):
      if (JSON.stringify(this.props.data[0]) !== JSON.stringify(prevProps.data[0]) ) {
        var state = this.state
        this.setState({data:this.props.data})
        this.setState({vals:['duration [min]'], aggregatorName:'Sum'})

      }

    }

    onProjectChange = (d, projects)=>{

      let project ={}

      if (projects.indexOf(d.value) === -1) {
        return false
      }

      for (let pr of projects) {
        projects[pr] = (pr == d.value)? true : false
      }


      this.setState({valueFilter: {projects:{'TNM_': true}}})

    }

    onPresetChange= (e)=>{

      switch (e.currentTarget.dataset.id) {
        case 'Minutes':
          this.setState({vals:['duration [min]'], aggregatorName:'Sum'})
          break;
        case 'MinuteAverege':
          this.setState({vals:['duration [min]'], aggregatorName:'Average'})
          break;
        case 'MinuteMax':
          this.setState({vals:['duration [min]'], aggregatorName:'Maximum'})
          break;
        case 'Plates':
          this.setState({aggregatorName:'Count'})

          break;
        default:

      }
    }

    render() {
        // console.log(this.props.data);
        var projects = []
        for (let item of this.props.data) {
            projects.push(item[0])

        }
        projects = [... new Set(projects)]



        return (
          <div>
            <Form >
              {/*<Form.Field style={{textAlign:'left', 'width':'400px'}}>
                <label>project</label>
                <Input list='languages' placeholder='Project filter' onChange={(e, d)=>this.onProjectChange(d, projects)}/>
                <datalist id='languages'>
                  {projects.map(value=>(
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </Form.Field>*/}
              <Form.Field>
                <label>filter presets</label>
                <Button data-id={'Minutes'} onClick={this.onPresetChange}>Minutes sum</Button>
                <Button data-id={'MinuteAverege'} onClick={this.onPresetChange}>Minutes average</Button>
                <Button data-id={'MinuteMax'} onClick={this.onPresetChange}>Minutes Maximum value</Button>
                <Button data-id={'Plates'} onClick={this.onPresetChange}>Plates</Button>
              </Form.Field>
            </Form>

            {/*<NavBar handler={this.onPresetChange} />*/}
            <Divider/>
            <PivotTableUI
                rendererName={'Table Heatmap'}
                data={this.state.data}
                cols={['week']}
                rows={['project']}
                vals={this.state.vals}
                aggregatorName ={this.state.aggregatorName}
                onChange={s => this.setState(s)}
                {...this.state}
            />
          </div>
        );
    }
}
