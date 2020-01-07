import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';


import { compose } from 'recompose';

import { withFirebase } from './Firebase';
import { withAuthorization, AuthUserContext, hasRights} from './Session';

import { Icon, Button, Form, Grid, Header, Image, Message, Segment, Item, Image as ImageComponent } from 'semantic-ui-react'

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

  render(){
    const paragraph = <ImageComponent src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
    const {loading, models} = this.state

    return(
      <div>
        <h1>Model Library</h1>

          {loading?
            <h1>Loading...</h1>
            :null
          }
          <Grid doubling columns={4}>

          {models && Object.entries(models).map( ([k, v])=>(
            <Grid.Column key={k}>
              <Item>
                <Item.Image size='tiny' src='https://react.semantic-ui.com/images/avatar/large/stevie.jpg' />

                <Item.Content>
                  <Item.Header>{k}</Item.Header>
                  <Item.Description>{v}</Item.Description>
                  <Item.Description>{paragraph}</Item.Description>
                  <Item.Description>
                    {/*<Button icon onClick = {this.deleteEntry}>*/}
                    <Button icon onClick = {this.deleteEntry}>
                      <Icon name='delete' />
                    </Button>
                  </Item.Description>
                </Item.Content>
              </Item>
            </Grid.Column>
          ))}
        </Grid>

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
