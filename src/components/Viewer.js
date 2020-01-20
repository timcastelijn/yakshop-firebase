import React from 'react';
import { Link } from 'react-router-dom';
import {Container, Menu, Divider, Button, Form, Grid, Header, Image, Message, Segment, Label, Icon} from 'semantic-ui-react'

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {Scene} from './three/Scene.js'

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

class Renderer extends React.Component{

  constructor(props){
    super(props)
  }

  async componentDidMount(){


    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )
    this.camera.position.set(   6,10,10);

    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setClearColor('#cccccc')
    // this.renderer.setClearColor(0xA9E7DA);
    this.renderer.setSize(width, height)
    this.mount.appendChild(this.renderer.domElement)

    this.scene = new Scene(this.camera, this.renderer)

    

    // modelLoading
    const modelId = this.props.match.params.modelId
    if (modelId === 'new') {
      // create empty field

    }else if (true) {
      this.loadModel(modelId)
    }




    this.onWindowResize();
    window.addEventListener('resize', this.onWindowResize);

    this.start()
  }

  loadModel = async (modelId) => {
    try{
        console.log(modelId);
       if (!modelId) { throw 'modelId not defined' }

       // query object, action 1 for 'GET'
       const data = { table:'models', columns:["content", 'name'], criteria:{'id':modelId} }
       data.action = 1

       const response = await fetch('./server/mysql_handler.php',{
               body: JSON.stringify(data), // must match 'Content-Type' header
               headers: {'content-type': 'application/json'},
               method: 'POST', // *GET, POST, PUT, DELETE, etc.
             })

       const result = await response.json();



       console.log('answer', result);

     } catch (e) {
       console.log(e);
     } finally {

     }
  }

  onWindowResize = () => {

    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( width , height );
  }


  componentWillUnmount(){
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
    window.removeEventListener('resize', this.onWindowResize);
  }

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  stop = () => {
    cancelAnimationFrame(this.frameId)
  }

  animate = () => {


   this.renderScene()
   this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene = () => {
    this.renderer.render(this.scene, this.camera)
  }

  render(){
      return(
        <div
          style={{ overflow:'hidden', width: '100%', height:"100%"}}
          ref={(mount) => { this.mount = mount }}
        />
      )
    }
}

class Viewer extends React.Component{

  constructor(props){
    super(props)
  }

  async componentDidMount(){

  }

  render(){
    return(
      <div className='fluid' style={{'background':'#cccccc', textAlign:'center', verticalAlign:'middle', height:'100vh', overflow:'hidden'}}>
        <Renderer {...this.props}/>
        <ViewerUI/>
      </div>
    )
  }
}

export default Viewer
