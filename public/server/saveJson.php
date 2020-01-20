<?php


  // if($_SESSION['valid']){

    $SAVE_LOCATION = '../config/';

    $filename = $_POST['filename'];
    $json = $_POST['json'];
    $image_data  = $_POST['img'];

    // count number of blocks
    $len = 0;
    foreach($json['geometry'] as $key => $item) { //foreach element in $arr
      $len = $len + 1;
    }

    // store image to file
    $image = explode('base64,',$image_data);

    $png = imagecreatefromstring ( base64_decode($image[1]) );
    imagealphablending($png, false);
    imagesavealpha($png, true);
    imagepng($png, $SAVE_LOCATION . $filename . '.png');

    // store config to file
    $info = json_encode($json, JSON_PRETTY_PRINT);

    $file = fopen($SAVE_LOCATION . $filename . '.json','w+');
    fwrite($file, $info);
    fclose($file);

    echo "Saved ". $len . " blocks as '" . $filename ."'\n";

  // } else {
  //   echo 'valid ' .$_SESSION['valid'] .'<br>';
  //   echo "Not logged in";
  // }

?>
