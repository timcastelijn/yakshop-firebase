import React from 'react';
import { Link, useParams, useEffect } from 'react-router-dom';
import {Container, Menu, Divider, Button, Form, Grid, Header, Image, Message, Segment, Label, Icon} from 'semantic-ui-react'

import { compose } from 'recompose';
import { withFirebase } from './Firebase';
import { withAuthorization } from './Session';

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

import {g} from '../globals.js';
import {Scene} from './three/Scene.js'
import {SceneManager} from './three/SceneManager.js'
import {Renderer} from '../three/Renderer.js'

class ViewerUI extends React.Component{
  constructor(props){
    super(props)
  }

  render(){
    return(
        <div style={{position:'absolute', width:'100vw', bottom:'0px', padding:'10px', overflow:'hidden'}}>
          <Grid columns={3}>
            <Grid.Column textAlign='left'>
              <Form.Group inline>
                <Label size='large'>
                  <Icon name='euro' /> 23
                </Label>
                <Button icon='shopping cart' />
              </Form.Group>
            </Grid.Column>
            <Grid.Column>
              <Form.Group inline>
                <Button icon='mouse pointer' />
                <Button icon='undo' />
                <Button icon='redo' />
                <Button icon='trash' />
              </Form.Group>
            </Grid.Column>
            <Grid.Column textAlign='right'>
              <Form.Group inline>
                <Button icon='file' />
                <Button icon='save' />
                <Button icon='folder' />
                <Button icon='upload' />
              </Form.Group>
            </Grid.Column>
          </Grid>
        </div>
    )
  }
}


class Viewer extends React.Component{

  constructor(props){
    super(props)

    this.state ={
      loading:false,
    }


    window.addEventListener('renderer-mounted', this.mountRenderer)
  }


  async componentDidMount(){

    this.renderer = g.renderer
    if(this.mount &&  this.renderer){
      this.renderer.mount = this.mount

      this.mount.appendChild(this.renderer.renderer.domElement)
      this.renderer.onWindowResize()

      const sceneManager = this.renderer.sceneManager
      const modelId = this.props.match.params.id
      console.log('modelId',modelId, sceneManager.currentModelId);

      if (modelId) {
        if (modelId != sceneManager.currentModelId) {
          this.setState({loading:true})
          sceneManager.clearScene()
          const loaded = await sceneManager.loadModel(modelId)
          this.setState({loading:false})
        }
      }
    }


  }

  // mountRenderer = async (event)=>{
  //   console.log('this.mount', this.mount);
  //   this.renderer = event.detail.renderer
  //
  //   function checkFlag(mount) {
  //       if(!mount) {
  //         console.log('wainting...');
  //          window.setTimeout(checkFlag, 100); /* this checks the flag every 100 milliseconds*/
  //       } else {
  //         return mount
  //         /* do something*/
  //       }
  //   }
  //   const mount = await checkFlag(this.mount)
  //
  //   console.log('mount mounted');
  //
  //   if(this.mount &&  this.renderer){
  //     console.log('this.mount', this.mount);
  //     console.log('this.renderer', this.renderer);
  //     this.renderer.mount = this.mount
  //     this.mount.appendChild(this.renderer.renderer.domElement)
  //
  //     this.renderer.onWindowResize()
  //
  //   }
  //
  // }



  render(){

    const {loading} = this.state

    const loadingStyle = {
      position: 'absolute',
      left: '50%',
      top: '50%',
      WebkitTransform: 'translate(-50%, -50%)',
      transform: 'translate(-50%, -50%)',
    }

    return(
      <div className='fluid' style={{'background':'#cccccc', textAlign:'center', verticalAlign:'middle', height:'100vh', overflow:'hidden'}}>
        {loading?<div style={loadingStyle}>loading...</div>:null}
        <div
          style={{ overflow:'hidden', width: '100%', height:"100%"}}
          ref={(mount) => { this.mount = mount }}
        />
        <ViewerUI/>
      </div>
    )
  }
}

const renderer = new Renderer(g.firebase)



// export default Viewer
export default compose(
  withFirebase,
)(Viewer);
