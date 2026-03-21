<?php
require_once '../config/db.php';
require_once '../config/helpers.php';

$db = getDB();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'register':
        $data = getInput();
        $required = ['first_name','last_name','age','email','phone','sex','password'];
        foreach ($required as $f) {
            if (empty($data[$f])) respondError("Field '$f' is required");
        }

        $email = $db->real_escape_string($data['email']);
        $check = $db->query("SELECT id FROM users WHERE email='$email'");
        if ($check->num_rows > 0) respondError('Email already registered');

        $hash = password_hash($data['password'], PASSWORD_BCRYPT);
        $fn = $db->real_escape_string($data['first_name']);
        $ln = $db->real_escape_string($data['last_name']);
        $age = (int)$data['age'];
        $phone = $db->real_escape_string($data['phone']);
        $sex = $db->real_escape_string($data['sex']);

        $db->query("INSERT INTO users (first_name,last_name,age,email,phone,sex,password) VALUES ('$fn','$ln',$age,'$email','$phone','$sex','$hash')");
        $userId = $db->insert_id;

        $emailBody = "Hello $fn,\n\nWelcome to PublicWatch! Your account has been successfully created.\n\nLogin Details:\nUsername: $email\nPassword: " . $data['password'] . "\n\nWith your PublicWatch account, you can:\n• Report civic and infrastructure issues in your area\n• Upload photos and exact location details\n• Track the progress of your complaints in real time\n• Contribute to making your city cleaner, safer, and more efficient\n\nLog in to your account and start reporting issues around you today.\n\nIf you did not create this account or need assistance, please contact our support team.\n\nBest regards,\nPublicWatch Team\nEmpowering Citizens. Improving Cities.";
        sendEmail($email, 'Welcome to PublicWatch - Account Created', $emailBody);

        respond(['message' => 'Account created successfully', 'user_id' => $userId]);
        break;

    case 'login':
        $data = getInput();
        if (empty($data['email']) || empty($data['password'])) respondError('Email and password required');

        $email = $db->real_escape_string($data['email']);
        $result = $db->query("SELECT * FROM users WHERE email='$email'");
        if ($result->num_rows === 0) respondError('Invalid credentials');

        $user = $result->fetch_assoc();
        if (!password_verify($data['password'], $user['password'])) respondError('Invalid credentials');

        unset($user['password']);
        respond(['message' => 'Login successful', 'user' => $user]);
        break;

    case 'profile':
        $id = (int)($_GET['id'] ?? 0);
        $result = $db->query("SELECT id,first_name,last_name,age,email,phone,sex,created_at FROM users WHERE id=$id");
        if ($result->num_rows === 0) respondError('User not found', 404);
        respond($result->fetch_assoc());
        break;

    default:
        respondError('Invalid action', 404);
}
?>
