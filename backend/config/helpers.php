<?php
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

function respondError($msg, $code = 400) {
    respond(['error' => $msg], $code);
}

function getInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function generateVVCMCId() {
    return 'VVCMCID' . str_pad(rand(10000, 99999), 5, '0', STR_PAD_LEFT);
}

function generateComplaintNo() {
    return 'PW' . date('Ymd') . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
}

// Send email using PHPMailer
function sendEmail($to, $subject, $body) {
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';                     // Set the SMTP server to send through
        $mail->SMTPAuth   = true;                                   // Enable SMTP authentication
        
        // =======================================================================
        // TODO: REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL GMAIL EMAIL & APP PASSWORD
        // =======================================================================
        $mail->Username   = 'apublicwatch297@gmail.com';                 // SMTP username
        $mail->Password   = 'truw jkwa doel zhdy';       // SMTP password
        // =======================================================================

        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Enable TLS encryption
        $mail->Port       = 587;                                    // TCP port to connect to

        // Recipients
        $mail->setFrom($mail->Username, 'PublicWatch System');
        $mail->addAddress($to);

        // Content
        $mail->Subject = $subject;
        $mail->Body    = $body;

        $mail->send();
        return true;
    } catch (Exception $e) {
        // Log the error if mail failed so that the API doesn't crash completely,
        // or optionally throw it. Currently logging to a file.
        $log = date('Y-m-d H:i:s') . " | Error sending email to: $to | Error: {$mail->ErrorInfo}\n";
        file_put_contents(__DIR__ . '/../email_error_log.txt', $log, FILE_APPEND);
        return false;
    }
}
?>
