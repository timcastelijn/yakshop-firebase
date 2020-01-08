

class SceneManager{
  constructor(firebase, renderer){
    this.firebase = firebase
    this.renderer = renderer
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

export default SceneManager
