
<?php

  require_once __DIR__.'/../sendmail.php';

  // include __DIR__.'/../mysql_handler.php';

  switch ($_POST['action']) {
    case 'sendmail':
      if ($_POST['type']=='registration') {
        sendMail( $_POST['type'], array('user_id' => $_POST['user_id'] ) );
      }else {
        sendMail( $_POST['type'], array('email' => $_POST['user_id'] ) );
      }
      break;

    default:
      # code...
      break;
  }



?>
