

<?php


  // $myvar1 = "INSERT INTO models (id, content, owner) VALUES (0, '[geometry:{this:{that:this}}]', 'friet')";
  $myvar1 = "INSERT INTO users (id, username, password, email) VALUES (0, 'max', 'redbull', 'ms@gmail.com')";
  // $myvar1 = "SHOW VARIABLES WHERE Variable_name = 'hostname'";
  // $myvar1 = "INSERT INTO users (id, username, password, email) VALUES (0, 'marte', 'friet', 'ms@gmail.com')";
  //$myvar1 = "SELECT id, username, email FROM users WHERE email='ms@gmail.com'";

  // $url = 'https://fabfield.000webhostapp.com/mysql_test.php';
  $url = 'https://timcastelijn.nl/fabfield/tc_mysql.php';
  $myvars = 'query_var=' . $myvar1;

  $ch = curl_init( $url );
  curl_setopt( $ch, CURLOPT_POST, 1);
  curl_setopt( $ch, CURLOPT_POSTFIELDS, $myvars);
  curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, 1);
  curl_setopt( $ch, CURLOPT_HEADER, 0);
  curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1);

  $response = curl_exec( $ch );

  echo $response;

  //
  // // create a new cURL resource
  // $ch = curl_init();
  //
  // // set URL and other appropriate options
  // curl_setopt($ch, CURLOPT_URL, "https://fabfield.000webhostapp.com/mysql_test.php?user=timcastelijn&email=t.castelijn@hotmail.com&password=99");
  // curl_setopt($ch, CURLOPT_HEADER, 0);
  //
  // // grab URL and pass it to the browser
  // curl_exec($ch);
  //
  // // close cURL resource, and free up system resources
  // curl_close($ch);




?>
