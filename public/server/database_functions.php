

<?php
  include 'sendmail.php';

  require_once __DIR__.'/random_compat/lib/random.php';

  // JWT
  require_once __DIR__.'/php-jwt-master/src/JWT.php';
  require_once __DIR__.'/php-jwt-master/src/BeforeValidException.php';
  require_once __DIR__.'/php-jwt-master/src/ExpiredException.php';
  require_once __DIR__.'/php-jwt-master/src/SignatureInvalidException.php';
  use \Firebase\JWT\JWT;
  $key = "K!N8jT3Utg";
  $sql_secret = "W?U7rN8Owd";

  function str_log($string){
    error_log(substr($string, 0, 300));
  }

//  include 'requestPassword.php';

  function ajaxReturn($bool, $data=NULL, $message=NULL){
    echo json_encode( array('result' => $bool, 'data' => $data, 'message' => $message));
  }

  function random_str(
      $length,
      $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  ) {
      $str = '';
      $max = mb_strlen($keyspace, '8bit') - 1;
      if ($max < 1) {
          throw new Exception('$keyspace must be at least two characters long');
      }
      for ($i = 0; $i < $length; ++$i) {
          $str .= $keyspace[random_int(0, $max)];
      }
      return $str;
  }



  function postQuery($myvar1, $action){

    global $sql_secret;

    // $url = 'https://fabfield.000webhostapp.com/mysql_test.php';
    // $url = 'https://fabfield.000webhostapp.com/sql_handler_dev.php';
    $url = 'https://timcastelijn.nl/fabfield/app/server/tc_mysql.php';
    // $url = 'sql_handler.php';
    $myvars = 'action='. $action . '&query_var=' . $myvar1 .'&secret=' . $sql_secret;

    $ch = curl_init( $url );
    curl_setopt( $ch, CURLOPT_POST, 1);
    curl_setopt( $ch, CURLOPT_POSTFIELDS, $myvars);
    curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt( $ch, CURLOPT_HEADER, 0);
    curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1);
    $result = curl_exec( $ch );

    curl_close($ch);

    return $result;
  }


  function createUUID(){
    $my_uuid = postQuery('SELECT UUID()', 1);

    $array_temp = (array) json_decode($my_uuid)["0"];
    $uuid = $array_temp['UUID()'];

    return $uuid;
  }



  /**
   * gets a database value
   *
   * @param string  $table
   * @param array   $columns  colums to return
   * @param object  $criteria selection criteria
   *
   * @return json
   */

  function getDb( $table, $columns, $criteria, $limit=0, $offset=0, $sort=FALSE) {

    // define which calls require auth
    // user account

    str_log ('getdb');

    // $query = "SELECT id FROM models WHERE user_id='0a0f6f41-0a4d-11e7-8644'";
    $query = "SELECT ";

    // add column selectors
    $columns = (array)$columns;
    $comma = "";
    foreach ($columns as $col) {
      $query = $query . $comma. $col ;
      $comma=", ";
    }
    $query = $query . " FROM " . $table;

    // add selection criteria, if exists
    if(!empty($criteria)){
      $query = $query . " WHERE ";
      $and = "";
      foreach($criteria as $key => $val)
      {
          $query = $query . $and . $key . "='" . $val. "'" ;
          $and = " AND ";
      }
    }

    str_log ('sort = '.$sort . ', limit = '. $limit );

    if($sort){
      $query = $query . " ORDER BY ". $sort ." DESC";
    }

    if($limit>0){
      $query = $query . " LIMIT " . $limit;
    }
    if($offset>0){
      $query = $query . " OFFSET " . $offset;
    }

    // $query = $query . " ORDER BY modified DESC LIMIT 20";


    str_log ($query);

    $result = json_decode(postQuery($query, 1), true); // result is []

    str_log('getdb result: '. json_encode($result));


    if(empty($result)){
      $response = array("result"=>false, "data"=>$result);
    }else{
      $response = array("result"=>true, "data"=>$result);
    }

    return $response;
  }


  function writeToDb($table, $data){

    // $query = "INSERT INTO models (id, name, content, img, user_id, user_name) VALUES ('". $uuid ."', '" .$filename. "','" . json_encode($json, JSON_PRETTY_PRINT) ."', 'server/" . $img_url . "', '" . $user_id ."', '".$username."')";
    $uuid = createUUID();

    // add columns and VALUES
    $columns  = "(";
    $values   = "(";
    if(!empty($data)){
      $comma = "";
      foreach($data as $key => $val)
      {
          $columns  = $columns . $comma . $key ;
          $values   = $values . $comma . "'" . $val . "'";
          $comma = ", ";
      }
    }
    $columns  = $columns . ", id)";
    $values   = $values . ", '" .$uuid. "')";

    $query = "INSERT INTO " . $table . ' ' . $columns . ' VALUES ' . $values;
    // echo $query;

    // str_log('writeToDb query:' . $query);

    $result = postQuery($query, 0);

    // str_log('result:' . $result);

    return $uuid;

    // $query = "INSERT INTO models (id, name, content, img, user_id, user_name) VALUES ('". $uuid ."', '" .$filename. "','" . json_encode($json, JSON_PRETTY_PRINT) ."', 'server/" . $img_url . "', '" . $user_id ."', '".$username."')";
  }


  function overWrite($table, $data, $id){

    // UPDATE table_name
    // SET column1 = value1, column2 = value2, ...
    // WHERE condition;

    // $sql = "UPDATE models SET content='".json_encode($json, JSON_PRETTY_PRINT). "' WHERE filename=". $filename;

    // add columns and VALUES
    $query = "UPDATE " . $table . " SET";

    if(!empty($data)){
      $comma = " ";
      foreach($data as $key => $val)
      {
        $query = $query . $comma . $key . " = '" . $val . "'" ;
        $comma = ", ";
      }
    }

    $query = $query . " WHERE id = '" . $id ."'";

    // str_log("overwrite \n" . $query);

    $result = postQuery($query, 0);
    str_log("overwrite " . $result);
    return $id;
  }



  function putDB( $table, $data, $check_values, $return_values, $overwrite){

    // get db
    $result_check = getDb($table, 'id', $check_values); // true => {result:true, data:[object]

    // get first result
    $arr = $result_check;

    str_log("putDB") ;


    if($arr['result'] == true){
      // entry alreay exists
      str_log ("duplicate found");

      if(!$overwrite ){
        str_log ("prompt overwrite " . json_encode($arr['data'][0]) );

        // entry exists and overwrite is false

        // prompt overwrite
        // return existing entry
        $response = array("result"=>false, "entry_already_exists"=>true, "data"=>$arr['data'][0] );
      }else{
        // entry exists and overwrite is true
        str_log( "overwrite entry" . $arr['data'][0]['id'] );
        // str_log('json array' . json_encode($arr));

        // update existing entry with new data
        $uuid = overWrite($table, $data, $arr['data'][0]['id'] );

        $data = $uuid;
        if(!empty($return_values)){
          $data = getDb($table, $return_values, array('id' => $uuid ))['data'][0];
        }
        $response = array("result"=>true, 'data'=>$data);

      }

    }else {
      // entry does not exist
      str_log( "writeToDb");
      // write data to DB
      $uuid = writeToDb($table, $data);

      $data = $uuid;

      if(!empty($return_values)){

        $data = getDb($table, $return_values, array('id' => $uuid ))['data'][0];
      }

      $response = array("result"=>true, 'data'=>$data);
    }

    return $response;
  }


  function deleteDB( $table, $criteria){

    // get db

    $result_check = getDb($table, 'id', $criteria); // true => {result:true, data:[object]

    // get first result
    $arr = $result_check;

    str_log("deleteDB");
    str_log(json_encode($arr));
    //something goes wrong here


    if($arr['result'] == true){

      // DELETE FROM table_name WHERE condition;

      $query = "DELETE FROM "  . $table;

      // add selection criteria, if exists
      if(!empty($criteria)){
        $query = $query . " WHERE ";
        $and = "";
        foreach($criteria as $key => $val)
        {
            $query = $query . $and . $key . "='" . $val. "'" ;

            $and = " AND ";
        }
      }

      $result = postQuery($query, 0);

      $response = array("result"=>true, 'data'=>$arr['data'][0]);

    }else {
      $response = array("result"=>false, 'data'=>'could not find database entry');
      str_log("deleteDB failed, could not find db entry");
    }

    return $response;

  }

  function isProtected($table){
      if ($table == 'users' || $table == 'orders') {
        return true;
      }else{
        return false;
      }
  }

  function setPassword($user_id, $password){

    $hashed = password_hash($password, PASSWORD_DEFAULT);

    // $sql = "UPDATE models SET content='".json_encode($json, JSON_PRETTY_PRINT). "' WHERE filename=". $filename;
    $name = 'freddy';

    str_log(json_encode($user_id));

    // $query = "UPDATE users SET username='". $name ."' WHERE id='". $user_id . "'";
    // $query = "UPDATE users SET username='Juan' WHERE id=";
    $query = "UPDATE users SET password='". $hashed ."' WHERE id='$user_id'";
    $return_data = json_decode(postQuery($query, 0), true);

    str_log(json_encode($return_data));
  }

  function generatePasswordMail($email, $url){

    $query = "SELECT id, username FROM users WHERE email='" . $email . "'";
    $return_data = json_decode(postQuery($query, 1), true);

    if(empty($return_data)){
        return false;
    }

    $user_id = $return_data[0]['id'];
    $username = $return_data[0]['username'];


    $password = random_str(10);

    setPassword($user_id, $password);

    $array = array('email' => $email, 'password' => $password, 'username' => $username, 'url' => $url );
    if(sendMail('requestPassword', $array )) {
      return true;
    }

    return false;
  }



?>
