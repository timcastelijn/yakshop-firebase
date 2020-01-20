<?php

		require 'mailer/PHPMailerAutoload.php';
  	// include 'requestPassword.php';


		function sendMail($mailtype, $data){

			$email = $data['email'];

			$mail = new PHPMailer;
			// $mail->SMTPDebug = 3;                               // Enable verbose debug output

			$mail->isSMTP();                                      // Set mailer to use SMTP

			$mail->Host = 's181.webhostingserver.nl';  							// Specify main and backup SMTP servers
			// $mail->Host = 'mail.thenewmakers.com';  							// Specify main and backup SMTP servers
			// $mail->SMTPDebug = 4;
			$mail->SMTPOptions = array(
			    'ssl' => array(
			        'verify_peer' => false,
			        'verify_peer_name' => false,
			        'allow_self_signed' => true
			    )
			);
			$mail->SMTPAuth = true;                               // Enable SMTP authentication
			$mail->Username = 'tim@thenewmakers.com';                 // SMTP username
			$mail->Password = '7UVgEPwef2';                           // SMTP password
			$mail->SMTPSecure = 'TLS';                            // Enable TLS encryption, `ssl` also accepted
			// $mail->SMTPSecure = 'ssl';                            // Enable TLS encryption, `ssl` also accepted
			$mail->Port = 587;                                    // TCP port to connect to
			$mail->setFrom('tim@thenewmakers.com', 'tim | thenewmakers');
			$mail->addAddress($email);     												// Add a recipient
			$mail->addReplyTo('tim@thenewmakers.com', 'tim | thenewmakers');

			// $mail->Host = 'send.one.com';  									// Specify main and backup SMTP servers
			// $mail->SMTPAuth = true;                               // Enable SMTP authentication
			// $mail->Username = 'fabfield@timcastelijn.nl';                 // SMTP username
			// $mail->Password = 'Voorbeeld10';                           // SMTP password
			// $mail->SMTPSecure = 'ssl';                            // Enable TLS encryption, `ssl` also accepted
			// $mail->Port = 465;                                    // TCP port to connect to
      //
			// $mail->setFrom('fabfield@timcastelijn.nl', 'tim ');
			// $mail->addAddress($email);     // Add a recipient
			// $mail->addReplyTo('fabfield@timcastelijn.nl', 'tim');




			$mail->isHTML(true);                                  // Set email format to HTML
			$message = "";

			switch ($mailtype) {
				case 'registration':

					$url 			= $data['url'];

					$mail->Subject = 'Welcome to fabfield';
					$mail->Body    = welcomeMessage( $url);
					$mail->AltBody = 'html message could not be shown';

					break;
				case 'requestPassword':

					$username = $data['username'];
					$password = $data['password'];
					$url 			= $data['url'];

					error_log('send mail');
					error_log(json_encode( $data));

					$mail->Subject = 'Reset Fabfield password';
					$mail->Body    = requestPasswordMessage( $username, $password, $url );
					$mail->AltBody = 'html message could not be shown';


					break;

				case 'confirmOrder':

					$id 					= $data['data']['id'];
					$username 		= $data['data']['username'];

					$mail->Subject = 'Fabfield order';
					$mail->Body    = orderMessage( $id, $username );
					$mail->AltBody = 'html message could not be shown';


					break;

				default:
					# code...
					break;
			}

			if(!$mail->send()) {
					// Message could not be sent
					error_log('mail could not be send');
					error_log($mail->ErrorInfo);
					return false;
			} else {
					// message has been sent
					return true;
			}
		}

		function orderMessage($id, $username){

			$message = "";
			$message .= "<html>";
			$message .= "  <head>";
			$message .= "    <meta http-equiv='Content-Language' content='en-us'>";
			$message .= "    <meta http-equiv='Content-Type' content='text/html; charset=windows-1252'>";
			$message .= "  </head>";
			$message .= "  <body style='font-family:Arial,Verdana; '>";
			$message .= "    <table align='center' width='100%' max-width='600px' border='0' cellspacing='0' cellpadding='0'>";
			$message .= "      <tr><td align='center' style='font-size:0.8em;'>if you cannot read this email <a href=''>click here to login</a></td></tr>";
			$message .= "      <tr><td><br/></td></tr>";
			$message .= " 		 <tr><td align='center'><img src='http://fabfield.com/app/images/fabfield-logo-temp_black.png' width='200px'></td></tr>";
			$message .= "      <tr><td><br></td></tr>";
				// $message .= "      <tr><td align='center'><h1>Welcome to Fabfield</h1></td></tr>";
			$message .= "      <tr><td align='center'>Hi $username. You have placed a new order. To review the order go to Fabfield.com and check your Account page.</td></tr>";
			$message .= "      <tr><td><br/></td></tr>";
		  // $message .= "      <tr><td align='center'>or click <a href='http://fabfield.com?model_id=" . $id . "'>here</a> to review the model </td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			$message .= "      <tr><td align='center'>if you have any questions or suggestions concerning the editor, please contact us at info@thenewmakers.com</td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			$message .= "      <tr><td align='center' style='font-size:0.8em;'>click <a href=''>here</a> if you do not wish to receive these emails in the future</td></tr>";
			$message .= "    </table>";
			$message .= "  </body>";
			$message .= "</html>";

			return $message;
		}

		function welcomeMessage($url){

			$message = "";
			$message .= "<html>";
			$message .= "  <head>";
			$message .= "    <meta http-equiv='Content-Language' content='en-us'>";
			$message .= "    <meta http-equiv='Content-Type' content='text/html; charset=windows-1252'>";
			$message .= "  </head>";
			$message .= "  <body style='font-family:Arial,Verdana; '>";
			$message .= "    <table align='center' width='100%' max-width='600px' border='0' cellspacing='0' cellpadding='0'>";
			$message .= "      <tr><td align='center' style='font-size:0.8em;'>if you cannot read this email <a href=''>click here to login</a></td></tr>";
			$message .= "      <tr><td><br/></td></tr>";
			$message .= " 		 <tr><td align='center'><img src='http://fabfield.com/app/images/fabfield-logo-temp_black.png' width='200px'></td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			// $message .= "      <tr><td align='center'><h1>Welcome to Fabfield</h1></td></tr>";
			$message .= "      <tr><td align='center'>Welcome, fabfield user. ";
			// $message .= "      <tr><td align='center'>or click the link to log in <a href='" . $url . "'>link</a></td></tr>";
			$message .= "      <tr><td align='center'>or click the link to log in <a href='http://fabfield.com'>link</a></td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			$message .= "      <tr><td align='center'>if you have any questions or suggestions concerning the editor, please contact us at info@thenewmakers.com</td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			$message .= "      <tr><td align='center' style='font-size:0.8em;'>click <a href=''>here</a> if you do not wish to receive these emails in the future</td></tr>";
			$message .= "    </table>";
			$message .= "  </body>";
			$message .= "</html>";

			return $message;
		}


		function requestPasswordMessage( $username, $password, $url){

			$message = "";
			$message .= "<html>";
			$message .= "  <head>";
			$message .= "    <meta http-equiv='Content-Language' content='en-us'>";
			$message .= "    <meta http-equiv='Content-Type' content='text/html; charset=windows-1252'>";
			$message .= "  </head>";
			$message .= "  <body style='font-family:Arial,Verdana; '>";
			$message .= "    <table align='center' width='100%' max-width='600px' border='0' cellspacing='0' cellpadding='0'>";
			$message .= "      <tr><td align='center' style='font-size:0.8em;'>if you cannot read this email <a href=''>click here to login</a></td></tr>";
			$message .= "      <tr><td><br/></td></tr>";
			$message .= " 		 <tr><td align='center'><img src='http://fabfield.com/app/images/fabfield-logo-temp_black.png' width='200px'></td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			// $message .= "      <tr><td align='center'><h1>Welcome to Fabfield</h1></td></tr>";
			$message .= "      <tr><td>Hi $username. You have requested a new password. Please use the auto-generated password below and set a new password in the Account page.</td></tr>";
			$message .= "      <tr><td><br/></td></tr>";
			$message .= "      <tr><td align='center'>your password is </td></tr>";
			$message .= "      <tr><td align='center'><h2>". $password . "</h2></td></tr>";
			$message .= "      <tr><td><br/></td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			// $message .= "      <tr><td align='center'>or click the link to log in <a href='" . $url . "'>link</a></td></tr>";
			$message .= "      <tr><td align='center'>or click the link to log in <a href='http://fabfield.com'>link</a></td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			$message .= "      <tr><td>if you have any questions or suggestions concerning the editor, please contact us at info@thenewmakers.com</td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			$message .= "      <tr><td align='center' style='font-size:0.8em;'>click <a href=''>here</a> if you do not wish to receive these emails in the future</td></tr>";
			$message .= "    </table>";
			$message .= "  </body>";
			$message .= "</html>";

			return $message;
		}

		function getRegistrationMessage($password, $url){

			$message = "";
			$message .= "<html>";
			$message .= "  <head>";
			$message .= "    <meta http-equiv='Content-Language' content='en-us'>";
			$message .= "    <meta http-equiv='Content-Type' content='text/html; charset=windows-1252'>";
			$message .= "  </head>";
			$message .= "  <body style='font-family:Arial,Verdana; '>";
			$message .= "    <table align='center' width='100%' max-width='600px' border='0' cellspacing='0' cellpadding='0'>";
			$message .= "      <tr><td align='center' style='font-size:0.8em;'>if you cannot read this email <a href=''>click here to login</a></td></tr>";
			$message .= "      <tr><td><br/></td></tr>";
			$message .= " 		 <tr><td align='center'><img src='http://fabfield.com/app/images/fabfield-logo-temp_black.png' width='200px'></td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			// $message .= "      <tr><td align='center'><h1>Welcome to Fabfield</h1></td></tr>";
			$message .= "      <tr><td>Welcome, fabfield user. Currenty authentication is done via email. For security reasons it is only possible to log in with the auto-generated password below.</td></tr>";
			$message .= "      <tr><td><br/></td></tr>";
			$message .= "      <tr><td align='center'>your password is </td></tr>";
			$message .= "      <tr><td align='center'><h2>". $password . "</h2></td></tr>";
			$message .= "      <tr><td><br/></td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			// $message .= "      <tr><td align='center'>or click the link to log in <a href='" . $url . "'>link</a></td></tr>";
			$message .= "      <tr><td align='center'>or click the link to log in <a href='http://fabfield.com'>link</a></td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			$message .= "      <tr><td>if you have any questions or suggestions concerning the editor, please contact us at info@thenewmakers.com</td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			$message .= "      <tr><td><br></td></tr>";
			$message .= "      <tr><td align='center' style='font-size:0.8em;'>click <a href=''>here</a> if you do not wish to receive these emails in the future</td></tr>";
			$message .= "    </table>";
			$message .= "  </body>";
			$message .= "</html>";

			return $message;


		}


?>
