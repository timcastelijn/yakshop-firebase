import * as THREE from 'three';


export class SceneManager{
  constructor(firebase, renderer, scene){
    this.firebase = firebase
    this.renderer = renderer
    this.scene = scene
    this.materials = {
      base: new THREE.MeshPhongMaterial({ color: '#433F81'     })

    }
  }


  loadModel(content){
    const geometry = new THREE.BoxGeometry(3, 3,3)

    const material = new THREE.MeshPhongMaterial({ color: '#433F81'     })


    for (var [uid,item] of Object.entries(content.geometry)) {

      const size = item.size

      if(item.size){

        const geometry = new THREE.BoxGeometry(3, 3,3)

        const material = new THREE.MeshPhongMaterial({ color: '#433F81'     })

        let cube = new THREE.Mesh(geometry, material)
        this.cube.applyMatrix4(new THREE.Matrix4().fromArray(item.matrixWorldArray))

        this.scene.add(cube)
      }
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
