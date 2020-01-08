import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';


import { compose } from 'recompose';
import update from 'immutability-helper';

import { withFirebase } from './Firebase';
import { withAuthorization, AuthUserContext, hasRights} from './Session';

import { Modal, Table, Icon, TextArea, Button, Form, Grid, Header, Image, Message, Segment, Item, Image as ImageComponent } from 'semantic-ui-react'



const PropEditor = ({item, onChange, id})=>(
  <div>
    <Form>
      <TextArea data-id={id} placeholder='Tell us more' style={{ minHeight: 100 }} value={item} onChange={onChange}/>
    </Form>

    <Table>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            {item}
          </Table.Cell>
          <Table.Cell>
            {item}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  </div>
)

class Library extends React.Component{

  constructor(props){
    super(props)

    this.state ={
      loading:false,
      models:null
    }
  }

  componentDidMount(){

    this.setState({loading:true});

    this.props.firebase.db.ref('models/').on("value", snapshot => {
      const modelList = snapshot.val();

      console.log(modelList);
      this.setState({
        models: modelList,
        loading: false,
      });
    })
  }

  saveEntry = (e, data)=>{

    console.log(e, data);
    const id = data.id;

    console.log('saveEntry', id);
    console.log('saveEntry', this.state.models[id]);

    // store in firebase
    this.props.firebase.db.ref(`/models/${id}`).set( this.state.models[id] );




  }

  editEntry =(e, {value})=>{
    console.log(e.currentTarget.dataset.id);
    const id = e.currentTarget.dataset.id;


    console.log(value);
    const model = update(this.state.models[id], {
        $set:value
    })
    this.setState({models:{[id]:model}})
  }

  render(){
    const paragraph = <ImageComponent src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
    const {loading, models} = this.state

    return(
      <div>
        <h1>User Models </h1>

          {loading?
            <h1>Loading...</h1>
            :null
          }
          <Grid doubling columns={4}>

          {models && Object.entries(models).map( ([k, v])=>(
            <Grid.Column key={k}>
              <Item>
                <Item.Image size='tiny'  src='https://react.semantic-ui.com/images/wireframe/image.png' />

                <Item.Content>
                  <Item.Header>uuid: {k}</Item.Header>
                  <Item.Description>content: {v}</Item.Description>
                  <Item.Description>{paragraph}</Item.Description>
                  <Item.Description>
                    {/*<Button icon onClick = {this.deleteEntry}>*/}
                    <Button data-id={k} icon onClick = {this.deleteEntry}>
                      <Icon name='trash' />
                    </Button>
                    <Modal
                      trigger={
                        <Button  icon>
                          <Icon name='edit' />
                        </Button>
                      }
                      header='Edit model!'
                      content={ <PropEditor id={k} item={v} onChange={this.editEntry}/> }
                      actions={[{ key: 'done', id:k, content: 'Save', className:'primary', onClick:this.saveEntry }]}
                    />

                  </Item.Description>
                </Item.Content>
              </Item>
            </Grid.Column>
          ))}
        </Grid>
        <h1>Preconfiured models </h1>

        <Item.Group link>
          <Item>
            <Item.Image size='tiny' src='https://react.semantic-ui.com/images/avatar/large/stevie.jpg' />

            <Item.Content>
              <Item.Header>Stevie Feliciano</Item.Header>
              <Item.Description>{paragraph}</Item.Description>
            </Item.Content>
          </Item>

          <Item>
            <Item.Image size='tiny' src='https://react.semantic-ui.com/images/avatar/large/veronika.jpg' />

            <Item.Content>
              <Item.Header>Veronika Ossi</Item.Header>
              <Item.Description>{paragraph}</Item.Description>
            </Item.Content>
          </Item>

          <Item>
            <Item.Image size='tiny' src='https://react.semantic-ui.com/images/avatar/large/jenny.jpg' />

            <Item.Content>
              <Item.Header>Jenny Hess</Item.Header>
              <Item.Description>{paragraph}</Item.Description>
            </Item.Content>
          </Item>
        </Item.Group>

      </div>
    )
  }
}

const condition = authUser => !!authUser;


export default compose(
  withFirebase,
)(Library);
