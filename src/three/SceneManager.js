import * as THREE from 'three';
import {g} from '../globals.js';

import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

function isBitSet( value, position ) {

  return value & ( 1 << position );

}

const convertVert = (vertexArray)=>{

  const vertices = []

  for (let i=0; i<vertexArray.length/3;i++){

    const x = vertexArray[ i * 3 + 0 ]
    const y = vertexArray[ i * 3 + 1 ]
    const z = vertexArray[ i * 3 + 2 ]

    vertices.push( new THREE.Vector3(x,y,z))
  }
  return vertices;
}

export class SceneManager{
  constructor(firebase, renderer, scene){
    this.firebase = firebase
    this.renderer = renderer
    this.scene = scene
    this.blocks = []
    this.currentModelId = null
    this.materials = {
      base: new THREE.MeshPhongMaterial({ color: '#433F81'     })

    }
  }

  init = async()=>{
    const filename = 'models/library_blocks/wi_i.json'
    const mesh = await this.load3DFile(filename)

    this.updateMorphTargets(mesh.geometry, [0,2,1,1])
  }


  updateMorphTargets = (geometry, influences)=>{
    const morphTargets = geometry.morphTargets
    const baseVertices = geometry.baseVertices

    // add morphTargets * influence factor to baseVertex
    const newBaseVertices = []

    for (let [i, baseVertex] of baseVertices.entries()) {
      newBaseVertices[i] = baseVertices[i].clone()
      for (let [j, mtVertices] of morphTargets.entries()) {
        newBaseVertices[i].add( new THREE.Vector3().addScaledVector(mtVertices[i], influences[j]) )
      }
    }
    const baseVertArray = []
    for (let vertex of newBaseVertices) {
      baseVertArray.push(vertex.x)
      baseVertArray.push(vertex.y)
      baseVertArray.push(vertex.z)
    }

    const vertices = new Float32Array( baseVertArray);
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );


    // for (let [i,vertex] of newBaseVertices.entries()) {
    //
    //   const moonDiv = document.createElement( 'div' );
    //   moonDiv.className = 'label';
    //   moonDiv.textContent = `${i}`;
    //   moonDiv.style.marginTop = '-1em';
    //   const moonLabel = new CSS2DObject( moonDiv );
    //
    //   const sphere = new THREE.SphereGeometry( 0.03, 32, 16 );
    //   const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    //   const mesh2 = new THREE.Mesh( sphere, material );
    //   mesh2.position.set(vertex.x, vertex.y, vertex.z)
    //
    //   mesh2.add( moonLabel );
    //   this.scene.add(mesh2)
    //
    // }

  }

  load3DFile = async(filename)=>{

    const file = await fetch(filename)
    const model = await file.json()


    //set animations
    // convert mtArray into morphtargets
    const influences = []
    const morphTargets = []
    for (let [i, mt] of model.morphTargets.entries()) {
        influences[i] = 1

        const mtVertices = convertVert(mt.vertices)
        morphTargets.push(mtVertices)
    }

    // set face indices
    const indices = []
    var offset = 0
    for (var i = 0; i < model.faces.length/10; i++) {

      const type = model.faces[i * 10] ;
      const isQuad = isBitSet( type, 0 );

      if(isQuad){
        const a = model.faces[i * 10 + 1]
        const b = model.faces[i * 10 + 2]
        const c = model.faces[i * 10 + 3]
        const d = model.faces[i * 10 + 4]

        indices.push( a, b, d ); // face one
        indices.push( b, c, d ); // face two
      }else{
        const a = model.faces[i * 10 + 1]
        const b = model.faces[i * 10 + 2]
        const c = model.faces[i * 10 + 3]

        indices.push( a, b, c ); // face one
      }
    }

    // construct geometry
    const geometry  = new THREE.BufferGeometry()
    geometry.setIndex(indices)

    // const vertices = new Float32Array( baseVertArray);
    // geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    const normals = new Float32Array( model.normals);
    geometry.setAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

    geometry.morphTargets = morphTargets

    const baseVertices = convertVert(model.vertices)
    geometry.baseVertices = baseVertices

    // set geometry morphTargets
    this.updateMorphTargets(geometry, [0,1,1,1])

    // add mesh to scene
    const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    const mesh = new THREE.Mesh( geometry, material );
    this.scene.add(mesh)

    return mesh
  }




  loadModel = async (uuid)=>{

    const modelRef = g.firebase.models().doc(uuid);
    const doc = await modelRef.get();
    if (!doc.exists) {
      console.log('No such document!');
      return false
    } else {

      this.currentModelId = uuid

      const content = doc.data().content
      const geometry = new THREE.BoxGeometry(3, 3,3)

      const material = new THREE.MeshPhongMaterial({ color: '#433F81'     })

      for (var [uid,item] of Object.entries(content.geometry)) {

        const size = item.size

        if(item.size){

          const geometry = new THREE.BoxGeometry(size[0],size[1],size[2])

          const material = new THREE.MeshPhongMaterial({ color: '#433F81'     })

          let cube = new THREE.Mesh(geometry, material)

          cube.geometry.applyMatrix(new THREE.Matrix4().fromArray(item.matrixWorldArray))

          this.scene.add(cube)
          this.blocks.push(cube)
        }
      }

      return true
    }
  }

  clearScene(){
    for (var block of this.blocks) {
      this.scene.remove(block)

      block.geometry.dispose()
      block.material && block.material.dispose();
      block.texture && block.texture.dispose();
    }
  }

  saveModel(){

    this.saveImage()
  }

  saveImage(){
    const message = this.renderer.domElement.toDataURL("image/png");

    console.log(message);
    if(true){
      // Create a reference to 'images/mountains.jpg'
      var storageRef = this.firebase.storage.ref();
      var mountainImagesRef = storageRef.child('thumbnails/mountains.png');
      mountainImagesRef.putString(message, 'data_url').then(function(snapshot) {
        console.log('Uploaded a data_url string!');
      });


    }
  }
}
