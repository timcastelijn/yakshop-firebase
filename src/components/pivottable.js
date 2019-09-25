

import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Menu, Divider, Form, Button } from 'semantic-ui-react'

import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';

// see documentation for supported input formats

export class PivotTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = props;


    }

    componentDidUpdate(prevProps) {
      // Typical usage (don't forget to compare props):
      if (JSON.stringify(this.props.data[0]) !== JSON.stringify(prevProps.data[0]) ) {
        var state = this.state
        this.setState({data:this.props.data})
        this.setState({vals:['duration [min]'], aggregatorName:'Sum'})

      }

    }

    onProjectChange(){

    }

    onPresetChange= (e)=>{
      console.log(e.currentTarget.dataset.id);

      switch (e.currentTarget.dataset.id) {
        case 'Minutes':
          this.setState({vals:['duration [min]'], aggregatorName:'Sum'})
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
            <Form style={{textAlign:'left', 'width':'400px'}}>
              <Form.Field>
                <label>project</label>
                <Input list='languages' placeholder='Project filter' onChange={this.onProjectChange}/>
                <datalist id='languages'>
                  {projects.map(value=>(
                    <option key={value} value={value} />
                  ))}
                </datalist>
              </Form.Field>
              <Form.Field>
                <label>filter presets</label>
                <Button data-id={'Minutes'} onClick={this.onPresetChange}>Minutes</Button>
                <Button data-id={'Plates'} onClick={this.onPresetChange}>Plates</Button>
              </Form.Field>
            </Form>
            <Divider/>
            <PivotTableUI
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
