<?php
  // print_r($_FILES);
  include './database_functions.php';

  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
      if (isset($_FILES['files'])) {
          $errors = [];
          $path = 'models/uploads/';
          $extensions = ['obj', 'OBJ'];

          $all_files = count($_FILES['files']['tmp_name']);

          for ($i = 0; $i < $all_files; $i++) {
              $file_name = $_FILES['files']['name'][$i];
              $file_tmp = $_FILES['files']['tmp_name'][$i];
              $file_type = $_FILES['files']['type'][$i];
              $file_size = $_FILES['files']['size'][$i];

              $file_ext = strtolower(end(explode('.', $_FILES['files']['name'][$i])));






              if (!in_array($file_ext, $extensions)) {
                  $errors[] = 'Extension not allowed: ' . $file_name . ' ' . $file_type;
              }

              if ($file_size > (256 * 1024 * 1024)) {
                  $errors[] = 'File size exceeds limit: ' . $file_name . ' ' . $file_type;
              }

              // get db

              $columns      = 'id';
              $check_values = array('name'=>$file_name, 'filesize'=>$file_size );
              $result_check = getDb('uploads', $columns, $check_values); // true => {result:true, data:[object]

              // get first result
              $arr = $result_check;
              str_log(json_encode($_FILES['files']));

              if($arr['result'] == true){
                str_log('file already exists');
                str_log('id:' . $arr['data'][0]['id']);
                echo json_encode( $arr['data'][0]['id'] );

                exit();
              }

              $data = array('name'=>$file_name, 'filesize'=>$file_size );

              $uuid = writeToDb('uploads', $data);


              $file = $path . $uuid . '.obj';


              if (empty($errors)) {
                  move_uploaded_file($file_tmp, $file);
                  echo json_encode($uuid);
              }
          }

          if ($errors) print_r($errors);
      }
  }else{
    print_r("no post");
  }

?>
