<?php
require_once '../config/db.php';
require_once '../config/helpers.php';

$db = getDB();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'register':
        $data = getInput();
        $required = ['full_name','email','contact_no','department','password'];
        foreach ($required as $f) {
            if (empty($data[$f])) respondError("Field '$f' required");
        }

        $email = $db->real_escape_string($data['email']);
        $check = $db->query("SELECT id FROM authorities WHERE email='$email'");
        if ($check->num_rows > 0) respondError('Email already registered');

        $vvcmcId = generateVVCMCId();
        // Make sure ID is unique
        while ($db->query("SELECT id FROM authorities WHERE vvcmc_id='$vvcmcId'")->num_rows > 0) {
            $vvcmcId = generateVVCMCId();
        }

        $hash = password_hash($data['password'], PASSWORD_BCRYPT);
        $name = $db->real_escape_string($data['full_name']);
        $phone = $db->real_escape_string($data['contact_no']);
        $dept = $db->real_escape_string($data['department']);
        $block = $db->real_escape_string($data['block_no'] ?? '');
        $floor = $db->real_escape_string($data['floor_no'] ?? '');
        $desk = $db->real_escape_string($data['desk_no'] ?? '');
        $post = $db->real_escape_string($data['post'] ?? '');
        $age = (int)($data['age'] ?? 0);
        $sex = $db->real_escape_string($data['sex'] ?? '');

        $db->query("INSERT INTO authorities (vvcmc_id,full_name,email,contact_no,department,block_no,floor_no,desk_no,post,age,sex,password) VALUES ('$vvcmcId','$name','$email','$phone','$dept','$block','$floor','$desk','$post',$age,'$sex','$hash')");

        $emailBody = "Dear $name,\n\nYour VVCMC PublicWatch Authority account has been created.\n\nYour Login Credentials:\nUsername (VVCMC ID): $vvcmcId\nPassword: {$data['password']}\n\nDepartment: {$data['department']}\n\nPlease login at the Government Portal and manage complaints for your department.\n\nBest regards,\nPublicWatch Government Team\nVasai-Virar City Municipal Corporation";
        sendEmail($data['email'], 'VVCMC PublicWatch - Authority Account Created', $emailBody);

        respond(['message' => 'Authority account created', 'vvcmc_id' => $vvcmcId]);
        break;

    case 'login':
        $data = getInput();
        if (empty($data['vvcmc_id']) || empty($data['password'])) respondError('VVCMC ID and password required');

        $vvcmcId = $db->real_escape_string($data['vvcmc_id']);
        $result = $db->query("SELECT * FROM authorities WHERE vvcmc_id='$vvcmcId'");
        if ($result->num_rows === 0) respondError('Invalid credentials');

        $auth = $result->fetch_assoc();
        if (!password_verify($data['password'], $auth['password'])) respondError('Invalid credentials');

        unset($auth['password']);
        respond(['message' => 'Login successful', 'authority' => $auth]);
        break;

    case 'workers':
        $dept = $db->real_escape_string($_GET['department'] ?? '');
        $where = $dept ? "WHERE department='$dept'" : '';
        $result = $db->query("SELECT * FROM workers $where ORDER BY name ASC");
        $workers = [];
        while ($row = $result->fetch_assoc()) $workers[] = $row;
        respond(['workers' => $workers]);
        break;

    case 'worker_by_id':
        $workerId = $db->real_escape_string($_GET['worker_id'] ?? '');
        $dept = $db->real_escape_string($_GET['department'] ?? '');
        $result = $db->query("SELECT * FROM workers WHERE worker_id='$workerId' AND department='$dept'");
        if ($result->num_rows === 0) respondError('Worker not found in this department');
        respond($result->fetch_assoc());
        break;

    case 'add_worker':
        $data = getInput();
        $workerId = $db->real_escape_string($data['worker_id'] ?? '');
        $name = $db->real_escape_string($data['name'] ?? '');
        $phone = $db->real_escape_string($data['phone'] ?? '');
        $dept = $db->real_escape_string($data['department'] ?? '');
        if (!$workerId || !$name || !$phone || !$dept) respondError('All fields required');

        $check = $db->query("SELECT id FROM workers WHERE worker_id='$workerId'");
        if ($check->num_rows > 0) respondError('Worker ID already exists');

        $db->query("INSERT INTO workers (worker_id,name,phone,department) VALUES ('$workerId','$name','$phone','$dept')");
        respond(['message' => 'Worker added']);
        break;

    case 'delete_worker':
        $workerId = $db->real_escape_string($_GET['worker_id'] ?? '');
        $db->query("DELETE FROM workers WHERE worker_id='$workerId'");
        respond(['message' => 'Worker deleted']);
        break;

    case 'notifications':
        $userId = (int)($_GET['user_id'] ?? 0);
        $result = $db->query("SELECT * FROM notifications WHERE user_id=$userId ORDER BY created_at DESC LIMIT 20");
        $notifs = [];
        while ($row = $result->fetch_assoc()) $notifs[] = $row;
        respond(['notifications' => $notifs]);
        break;

    case 'mark_read':
        $data = getInput();
        $userId = (int)($data['user_id'] ?? 0);
        $db->query("UPDATE notifications SET is_read=1 WHERE user_id=$userId");
        respond(['message' => 'Marked read']);
        break;

    default:
        respondError('Invalid action', 404);
}
?>
