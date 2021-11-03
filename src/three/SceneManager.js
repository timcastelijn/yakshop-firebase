import * as THREE from 'three';
import {g} from '../globals.js';


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

  init(){
    const geometry = new THREE.BoxGeometry(3, 3, 3)
    const material = new THREE.MeshPhongMaterial({ color: '#433F81'     })
    const cube = new THREE.Mesh(geometry, material)
    this.scene.add(cube)
    this.blocks.push(cube)
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
