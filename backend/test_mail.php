<?php
require_once __DIR__ . '/config/helpers.php';

echo "Attempting to send a test email...<br>";

// Replace this with your personal email so you can check if you receive it
$testEmail = 'rushikeshk524@gmail.com'; 

$subject = 'Test Email from PublicWatch';
$body = "Hello!\n\nIf you are reading this, PHPMailer is working perfectly.\n\nBest regards,\nPublicWatch System";

$result = sendEmail($testEmail, $subject, $body);

if ($result) {
    echo "<br><strong style='color:green;'>SUCCESS: The test email was sent! Please check your inbox (and spam folder).</strong>";
} else {
    echo "<br><strong style='color:red;'>FAILED: The email could not be sent. Check backend/email_error_log.txt for details.</strong>";
}
?>
