

<?php


  function saveImage( $img_url, $image_data){
    // store image to file
    $image = explode('base64,',$image_data);

    $png = imagecreatefromstring ( base64_decode($image[1]) );
    imagealphablending($png, false);
    imagesavealpha($png, true);
    imagepng($png, $img_url);
  }

  // get post variables
  $filename     = $_POST['filename'];
  $img_data     = $_POST['img_data'];

  $response = saveImage($filename,  $img_data);
  echo json_encode(array("result"=>true));

?>
