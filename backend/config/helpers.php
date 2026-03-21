<?php
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

// Simple email simulation - in production use PHPMailer or SMTP
function sendEmail($to, $subject, $body) {
    // In production: use mail() or PHPMailer
    // For demo, we log to a file
    $log = date('Y-m-d H:i:s') . " | TO: $to | SUBJECT: $subject\n$body\n---\n";
    file_put_contents(__DIR__ . '/../email_log.txt', $log, FILE_APPEND);
    return true;
}
?>
