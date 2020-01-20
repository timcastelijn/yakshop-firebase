<?php

// $servername = "localhost";
// $username = "id828177_timcastelijn";
// $password = "Fabfield10";
// $dbname = "id828177_fabfield";
ob_start();

if ($_POST['secret'] == 'W?U7rN8Owd' ) {
  $servername = "timcastelijn.nl.mysql";
  $username = "timcastelijn_nl_fabfield";
  $password = "Voorbeeld10";
  $dbname = "timcastelijn_nl_fabfield";

  // Create connection
  $conn = new mysqli($servername, $username, $password, $dbname);
  // Check connection
  if ($conn->connect_error) {
     die("Connection failed: " . $conn->connect_error);
     echo 'conection failed';

  }

  // get the query string from the sender and return
  $sql = $_POST['query_var'];
  $result = $conn->query($sql);

  if($result){
    switch ($_POST['action']) {
        case 0:
            // insert
            echo json_encode($result);
            break;
        case 1:
            //get
            $json = array();
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    array_push($json, $row);
                }
            }
            // header('Content-Type: application/json');
            echo json_encode($json);
            break;
        case 2:
            if($result->num_rows > 0){
              echo 'true';
            }else{
              echo 'false';
            }
            break;
        default:
            echo 'no action specified, please contact administrator';
    }

  }else{
    echo 'false';
    echo "\r\n";
    echo 'Query: ' . $sql;
    echo "\r\n";
    echo 'Error: ' . $conn->error;
  }

  $conn->close();
}else{
  echo 'false';
  echo 'secrets do not match';
}


?>
