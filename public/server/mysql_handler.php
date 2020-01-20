

<?php
  require_once __DIR__.'/random_compat/lib/random.php';

  include './database_functions.php';

  // JWT
  require_once __DIR__.'/php-jwt-master/src/JWT.php';
  require_once __DIR__.'/php-jwt-master/src/BeforeValidException.php';
  require_once __DIR__.'/php-jwt-master/src/ExpiredException.php';
  require_once __DIR__.'/php-jwt-master/src/SignatureInvalidException.php';
  use \Firebase\JWT\JWT;
  $key = "K!N8jT3Utg";
  $sql_secret = "W?U7rN8Owd";

  error_log(json_encode($_POST));


// convert parameters in case of ES6 fetch()
  if (empty($_POST)) {
    $rawPostBody = file_get_contents('php://input');
    $_POST = json_decode($rawPostBody, true);
  }



  function hasAccess($access_token, $key, $table){

      try {
        $decoded = JWT::decode($access_token, $key, array('HS256'));
        error_log('$decoded');
        error_log(json_encode( $decoded ));

        $user_id = $decoded->aud;

        error_log( 'user_id' . $user_id );

        $response = getDb('users', array( 'role' ), array('user_id' => $user_id ), 1);
        $role = $response['data'][0]['role'];

        error_log( 'user_id: ' . $user_id . ', role: ' . $role );

        // $domain == 'localhost';

        // $domain == 'fabfield.com';
        // $domain == 'avex.com';
        return true;
      }catch(Exception $e) {
        // cannot decode token
        return false;
      }



      // ## setup for RBAC in mysql 5.7
      //
      //CREATE TABLE labels_customers_json (
      //  id INT,
      //  customer_id INT,
      //  labels JSON
      //);
      //
      //INSERT INTO labels_customers_json VALUES
      //	  (1, 1, '["ADMIN"]'),
      //   	(2, 2, '["BAR", "ADMIN"]'),
      //   	(3, 3, '["EVERYONE"]');
      //
      //    SELECT *
      //    FROM `models`
      //    WHERE JSON_CONTAINS(`permission_groups`, '"ADMIN"') > 0
      //    OR JSON_CONTAINS(`permission_groups`, '"EVERYONE"') > 0;




      // switch ($role) {
      //   case 'admin':
      //     // code...
      //     permissions={
      //       $users:{all:[r, w,]};
      //       $users:{all:[r, w]};
      //       $users:{all:[r, w]};
      //     }
      //     break;
      //   case 'avex_admin':
      //     // code...
      //     permissions={
      //       $users:{avex:[get, put, modify]};
      //       $users:{avex:[get, put, modify]};
      //       $users:{avex:[get, put, modify]};
      //     }
      //     break;
      //
      //   default:
      //     // code...
      //     break;
      // }
  }


  switch ($_POST['action']) {

      case 1:
          // get all matching entries for one request
          $table          = $_POST['table'];
          $columns        = $_POST['columns'];
          $criteria       = isset($_POST['criteria'])? $_POST['criteria'] : array();
          $limit          = isset($_POST['limit'])? $_POST['limit'] : 0;
          $offset         = isset($_POST['offset'])? $_POST['offset'] : 0;
          $sort           = isset($_POST['sort'])? $_POST['sort'] : FALSE;
          $access_token   = isset($_POST['access_token'])? $_POST['access_token'] : '';

          if (hasAccess($access_token, $key, $table)) {
            // code...
            error_log('Access granted');
          }

          if (isProtected($table)){
            try {
              $decoded = JWT::decode($access_token, $key, array('HS256'));
              //If the exception is thrown, the rest of this function will not be executed
              $response = getDb($table, $columns, $criteria, $limit, $offset, $sort);
              error_log( 'authenticated call succesful');
            }catch(Exception $e) {
              // cannot decode token
              $response = array('result' => false, 'token_invalid'=>true, 'data' =>  'authenticated call failed: ' .$e->getMessage());
              error_log( 'authenticated call failed: ' .$e->getMessage() );
            }
          }else {
            // table is not protected
            $response = getDb($table, $columns, $criteria, $limit, $offset, $sort);
          }


          /*
            reponse variants:

            {result:false, data:'authenticated call failed'}
            {result:false, data:[]}
            {result:true,  data:[val1, val2]}

          */
          // header('Access-Control-Expose-Headers: Content-Length');
          echo json_encode($response);
          break;

      case 2:
          //put user data
          $table        = $_POST['table'];
          $data         = $_POST['data'];
          $check_value  = $_POST['criteria'];
          $return_values= $_POST['return_values'];
          $overwrite    = false;

          if ($data['email']=='t.castelijn@hotmail.com') {
            $overwrite    = true;
          }


          //add password
          // $keyspace     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.
    	    //         		    '0123456789-=~!@#$%^&*_+?';
    			// $password     = random_str(10, $keyspace);

          // hash the password
          $password = $data['password'];
          $data['password'] = password_hash($password, PASSWORD_DEFAULT);

          $response = putDB( $table, $data, $check_value, $return_values, $overwrite);


          // get id from response
          $user_id = $response['data']['id'];

          $headers = apache_request_headers();
          $url = $headers['origin'] . '?user_id=' . $user_id;

          sendMail('registration', array('email'=> $data['email'], 'url' => $url));

          /*
            reponse variants:

            {result:false, entry_already_exists:true, data:entry_id );
            {result:true,  data:entry_id}
            {result:true,  data:[retval1, retval2]}

          */

          echo json_encode($response);
          // error_log(json_encode($response));
          break;

      case 3:
          // log in
          // get user_id + token
          $table = $_POST['table'];
          $columns = $_POST['columns'];
          $criteria = isset($_POST['criteria'])? $_POST['criteria'] : array();
          $limit = isset($_POST['limit'])? $_POST['limit'] : 0;
          $offset = isset($_POST['offset'])? $_POST['offset'] : 0;
          $sort = isset($_POST['sort'])? $_POST['sort'] : FALSE;

          $password = $criteria['password'];
          unset($criteria['password']);

          str_log(json_encode($columns));
          array_push($columns,"password");

          $response = getDb($table, $columns, $criteria, $limit, $offset, $sort);

          if($response['result']){

            if(password_verify($password , $response['data'][0]['password'] ) ){

              // remove password from response
              $response['data'][0]['password'] = '';

              // generate a JWT
              $aud = $response['data'][0]['id'];
              $key = $GLOBALS['key'];
              $token = array(
                  "iss" => "http://fabfield.com",
                  "aud" => $aud, //client id here
                  // "exp" => time() + 60 // 1 min valid
                  "exp" => time() + 24 * 3600 // 24 h valid
              );

              try{
                $access_token = JWT::encode($token, $key);
                $response['data'][0]['access_token'] = $access_token;
                echo json_encode($response);
                break;
              }catch(Exception $e){
                error_log('JWT could not be created');
              }
            }
          }

          /*
            reponse variants:

            {result:false);
            {result:true,  data:userdata-including-accesstoken}

          */

          echo json_encode(array("result"=>false));

          break;

      case 5:
          //put data
          $table          = $_POST['table'];
          $data           = $_POST['data'];
          $check_value    = $_POST['criteria']? $_POST['criteria'] : array();
          $return_values  = $_POST['return_values'];
          $overwrite      = $_POST['overwrite'] === 'true';
          $access_token   = isset($_POST['access_token'])? $_POST['access_token'] : '';

          // this is used in UpdateAcountInfo, very confusing
          if (isset($data['password'])) {
            # hash any posted password
            $password = $data['password'];
            $data['password'] = password_hash($password, PASSWORD_DEFAULT);
          }

          try {
            $decoded = JWT::decode($access_token, $key, array('HS256'));
            //decode will throw exception if token is not valid.

            $response       = putDB( $table, $data, $check_value, $return_values, $overwrite);
            str_log( 'authenticated call succesful');

          }catch(Exception $e) {
            // authentication failed, request a re-login
            $response = array('result' => false, 'token_invalid'=>true, 'data' =>  'authenticated call failed: ' .$e->getMessage());
            str_log( 'authenticated call failed: ' .$e->getMessage() );
          }


          /*
            reponse variants:

            {result:false, token_invalid:true, data:$msg );
            {result:false, entry_already_exists:true, data:entry_id );
            {result:true,  data:entry_id}
            {result:true,  data:[retval1, retval2]}

          */
          echo json_encode($response);

          break;
      case 6:
          //delete data
          // get all models for one user
          $table        = $_POST['table'];
          $data         = $_POST['data'];
          $check_value  = $_POST['criteria'];
          $access_token   = isset($_POST['access_token'])? $_POST['access_token'] : '';

          try {
            $decoded = JWT::decode($access_token, $key, array('HS256'));
            //decode will throw exception if token is not valid.

            $response = deleteDB( $table, $check_value);
            str_log( 'authenticated call succesful');

          }catch(Exception $e) {
            // authentication failed, request a re-login
            $response = array('result' => false, 'token_invalid'=>true, 'data' =>  'authenticated call failed: ' .$e->getMessage());
            str_log( 'authenticated call failed: ' .$e->getMessage() );
          }

          /*
            reponse variants:

            {result:false, token_invalid:true, data:$msg );
            {result:false,  data:$msg}
            {result:true,  data:id}

          */

          echo json_encode($response);

          break;
      case 7:
          //request new password
          // get all models for one user
          $email        = $_POST['email'];

          $headers = apache_request_headers();
          $url = $headers['origin'] . '?user_id=' . $user_id;

          if (generatePasswordMail($email, $url)) {
            ajaxReturn(true, '');
          }else {
            ajaxReturn(false, '');
          }

          /*
            reponse variants:

            {result:false,  data:}
            {result:true,  data:}

          */


          break;
      case 8:
          //check origin
          // get all models for one user
          $referrer   = $_POST['referrer'];
          $key        = $_POST['key'];

          $columns    = array("name");
          $criteria   = array('license_key' => $key, 'url' => 'https://www.thenewmakers.com/sample-page/');
          $result     = getDb('license', $columns, $criteria);

          str_log(json_encode($criteria));

          if($result['result'] == true){
            ajaxReturn(true, $result['data'][0]['name']);
          }else{
            header('HTTP/1.1 500 Internal Server Error');
            header('Content-Type: application/json; charset=UTF-8');
            die(json_encode(array('message' => 'ERROR in origin check', 'code' => 1337)));
          }

          break;

      case 9:
          //put data
          $data           = $_POST['data'];

          sendMail('confirmOrder', array('email'=> 'tim@thenewmakers.com', 'data' => $data));
          sendMail('confirmOrder', array('email'=> $data['email'], 'data' => $data));

          break;
      default:
          ajaxReturn(false, 'no action specified, please contact administrator');
  }



?>
