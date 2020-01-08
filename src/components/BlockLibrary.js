import React, { Component } from 'react';
// import { withRouter } from 'react-router-dom';


// import { compose } from 'recompose';
// import update from 'immutability-helper';

// import { withFirebase } from './Firebase';
// import { withAuthorization, AuthUserContext, hasRights} from './Session';

import { Grid, Image} from 'semantic-ui-react'



class BlockLibrary extends React.Component{
  render(){
    return(
      <div style={{padding:'2rem'}}>
        <Grid columns={3} doubling>
          <Grid.Row>
            <Grid.Column>
              <Image src='https://react.semantic-ui.com/images/wireframe/image.png' onClick={this.props.onClose}/>
            </Grid.Column>
            <Grid.Column>
              <Image src='https://react.semantic-ui.com/images/wireframe/image.png' onClick={this.props.onClose}/>
            </Grid.Column>
            <Grid.Column>
              <Image src='https://react.semantic-ui.com/images/wireframe/image.png' onClick={this.props.onClose}/>
            </Grid.Column>
            <Grid.Column>
              <Image src='https://react.semantic-ui.com/images/wireframe/image.png' onClick={this.props.onClose}/>
            </Grid.Column>
            <Grid.Column>
              <Image src='https://react.semantic-ui.com/images/wireframe/image.png' onClick={this.props.onClose}/>
            </Grid.Column>
            <Grid.Column>
              <Image src='https://react.semantic-ui.com/images/wireframe/image.png' onClick={this.props.onClose}/>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>

    )
  }
}

export default BlockLibrary
