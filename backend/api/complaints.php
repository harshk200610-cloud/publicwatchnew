<?php
require_once '../config/db.php';
require_once '../config/helpers.php';

$db = getDB();
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

switch ($action) {
    case 'create':
        // Handle multipart form data
        $userId = (int)($_POST['user_id'] ?? 0);
        if (!$userId) respondError('User ID required');

        $complaintNo = generateComplaintNo();
        $prabhag = $db->real_escape_string($_POST['prabhag'] ?? '');
        $department = $db->real_escape_string($_POST['department'] ?? '');
        $complaintType = $db->real_escape_string($_POST['complaint_type'] ?? '');
        $subject = $db->real_escape_string($_POST['subject'] ?? '');
        $description = $db->real_escape_string($_POST['description'] ?? '');
        $latitude = $db->real_escape_string($_POST['latitude'] ?? '');
        $longitude = $db->real_escape_string($_POST['longitude'] ?? '');
        $exactLocation = $db->real_escape_string($_POST['exact_location'] ?? '');

        // Handle image uploads
        $imagePaths = [];
        if (!empty($_FILES['images'])) {
            $uploadDir = '../uploads/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

            foreach ($_FILES['images']['tmp_name'] as $key => $tmp) {
                if ($_FILES['images']['error'][$key] === UPLOAD_ERR_OK) {
                    $ext = pathinfo($_FILES['images']['name'][$key], PATHINFO_EXTENSION);
                    $fname = uniqid('img_') . '.' . $ext;
                    move_uploaded_file($tmp, $uploadDir . $fname);
                    $imagePaths[] = 'uploads/' . $fname;
                }
            }
        }
        $imagesJson = $db->real_escape_string(json_encode($imagePaths));

        $db->query("INSERT INTO complaints (complaint_no,user_id,prabhag,department,complaint_type,subject,description,latitude,longitude,exact_location,images) VALUES ('$complaintNo',$userId,'$prabhag','$department','$complaintType','$subject','$description','$latitude','$longitude','$exactLocation','$imagesJson')");
        $complaintId = $db->insert_id;

        // Get user details for email
        $userRes = $db->query("SELECT * FROM users WHERE id=$userId");
        $user = $userRes->fetch_assoc();

        $emailBody = "Dear {$user['first_name']},\n\nYour complaint has been successfully submitted.\n\nComplaint Details:\nComplaint No: $complaintNo\nSubject: {$_POST['subject']}\nDepartment: {$_POST['department']}\nPrabhag: {$_POST['prabhag']}\nLocation: {$_POST['exact_location']}\nStatus: Reported\n\nYou will be notified when the status changes.\n\nBest regards,\nPublicWatch Team";
        sendEmail($user['email'], "Complaint Submitted - $complaintNo", $emailBody);

        // Add notification
        $msg = $db->real_escape_string("Your complaint '$subject' has been submitted successfully. Complaint No: $complaintNo");
        $db->query("INSERT INTO notifications (user_id,complaint_id,message) VALUES ($userId,$complaintId,'$msg')");

        respond(['message' => 'Complaint submitted', 'complaint_no' => $complaintNo, 'complaint_id' => $complaintId]);
        break;

    case 'feed':
        $page = (int)($_GET['page'] ?? 1);
        $limit = 10;
        $offset = ($page - 1) * $limit;

        $sql = "SELECT c.*, u.first_name, u.last_name,
                (SELECT COUNT(*) FROM upvotes WHERE complaint_id=c.id) as upvote_count,
                (SELECT COUNT(*) FROM comments WHERE complaint_id=c.id) as comment_count
                FROM complaints c
                JOIN users u ON c.user_id = u.id
                ORDER BY c.created_at DESC
                LIMIT $limit OFFSET $offset";
        $result = $db->query($sql);

        $complaints = [];
        while ($row = $result->fetch_assoc()) {
            $row['images'] = json_decode($row['images'] ?? '[]', true);
            $complaints[] = $row;
        }

        $total = $db->query("SELECT COUNT(*) as c FROM complaints")->fetch_assoc()['c'];
        respond(['complaints' => $complaints, 'total' => $total, 'page' => $page]);
        break;

    case 'single':
        $id = (int)($_GET['id'] ?? 0);
        $result = $db->query("SELECT c.*, u.first_name, u.last_name, u.email, u.phone FROM complaints c JOIN users u ON c.user_id=u.id WHERE c.id=$id");
        if ($result->num_rows === 0) respondError('Not found', 404);
        $row = $result->fetch_assoc();
        $row['images'] = json_decode($row['images'] ?? '[]', true);

        // Get comments
        $comments = [];
        $cRes = $db->query("SELECT cm.*, u.first_name, u.last_name FROM comments cm JOIN users u ON cm.user_id=u.id WHERE cm.complaint_id=$id ORDER BY cm.created_at ASC");
        while ($c = $cRes->fetch_assoc()) $comments[] = $c;
        $row['comments'] = $comments;

        respond($row);
        break;

    case 'my_complaints':
        $userId = (int)($_GET['user_id'] ?? 0);
        $result = $db->query("SELECT c.*,
            (SELECT COUNT(*) FROM upvotes WHERE complaint_id=c.id) as upvote_count,
            (SELECT COUNT(*) FROM comments WHERE complaint_id=c.id) as comment_count
            FROM complaints c WHERE c.user_id=$userId ORDER BY c.created_at DESC");
        $complaints = [];
        while ($row = $result->fetch_assoc()) {
            $row['images'] = json_decode($row['images'] ?? '[]', true);
            $complaints[] = $row;
        }
        respond(['complaints' => $complaints]);
        break;

    case 'upvote':
        $data = getInput();
        $complaintId = (int)($data['complaint_id'] ?? 0);
        $userId = (int)($data['user_id'] ?? 0);

        $check = $db->query("SELECT id FROM upvotes WHERE complaint_id=$complaintId AND user_id=$userId");
        if ($check->num_rows > 0) {
            $db->query("DELETE FROM upvotes WHERE complaint_id=$complaintId AND user_id=$userId");
            $db->query("UPDATE complaints SET upvotes=upvotes-1 WHERE id=$complaintId AND upvotes>0");
            respond(['action' => 'removed']);
        } else {
            $db->query("INSERT INTO upvotes (complaint_id,user_id) VALUES ($complaintId,$userId)");
            $db->query("UPDATE complaints SET upvotes=upvotes+1 WHERE id=$complaintId");
            respond(['action' => 'added']);
        }
        break;

    case 'comment':
        $data = getInput();
        $complaintId = (int)($data['complaint_id'] ?? 0);
        $userId = (int)($data['user_id'] ?? 0);
        $comment = $db->real_escape_string($data['comment'] ?? '');
        if (!$comment) respondError('Comment required');
        $db->query("INSERT INTO comments (complaint_id,user_id,comment) VALUES ($complaintId,$userId,'$comment')");
        $id = $db->insert_id;
        $user = $db->query("SELECT first_name,last_name FROM users WHERE id=$userId")->fetch_assoc();
        respond(['id' => $id, 'user' => $user, 'comment' => $data['comment'], 'created_at' => date('Y-m-d H:i:s')]);
        break;

    case 'escalate':
        $data = getInput();
        $complaintId = (int)($data['complaint_id'] ?? 0);
        $userId = (int)($data['user_id'] ?? 0);
        $reason = $db->real_escape_string($data['reason'] ?? 'Work not completed in time');

        $db->query("INSERT INTO escalations (complaint_id,user_id,reason) VALUES ($complaintId,$userId,'$reason')");

        // Get authority email for this complaint
        $comp = $db->query("SELECT c.*, u.first_name, u.last_name FROM complaints c JOIN users u ON c.user_id=u.id WHERE c.id=$complaintId")->fetch_assoc();
        $authRes = $db->query("SELECT * FROM authorities WHERE department='" . $db->real_escape_string($comp['department']) . "' LIMIT 1");
        if ($authRes->num_rows > 0) {
            $auth = $authRes->fetch_assoc();
            sendEmail($auth['email'], "ESCALATION ALERT - " . $comp['complaint_no'], "Escalation raised for complaint {$comp['complaint_no']} by {$comp['first_name']} {$comp['last_name']}. Reason: $reason");
        }

        // Notify user
        $msg = $db->real_escape_string("Your escalation for complaint #{$comp['complaint_no']} has been raised.");
        $db->query("INSERT INTO notifications (user_id,complaint_id,message) VALUES ($userId,$complaintId,'$msg')");

        respond(['message' => 'Escalation submitted']);
        break;

    case 'check_upvote':
        $complaintId = (int)($_GET['complaint_id'] ?? 0);
        $userId = (int)($_GET['user_id'] ?? 0);
        $check = $db->query("SELECT id FROM upvotes WHERE complaint_id=$complaintId AND user_id=$userId");
        respond(['upvoted' => $check->num_rows > 0]);
        break;

    // Gov actions
    case 'gov_list':
        $dept = $db->real_escape_string($_GET['department'] ?? '');
        $status = $db->real_escape_string($_GET['status'] ?? '');
        $where = "WHERE c.department='$dept'";
        if ($status) $where .= " AND c.status='$status'";
        $result = $db->query("SELECT c.*, u.first_name, u.last_name, u.phone as user_phone, u.email as user_email,
            (SELECT COUNT(*) FROM upvotes WHERE complaint_id=c.id) as upvote_count
            FROM complaints c JOIN users u ON c.user_id=u.id $where ORDER BY c.created_at DESC");
        $complaints = [];
        while ($row = $result->fetch_assoc()) {
            $row['images'] = json_decode($row['images'] ?? '[]', true);
            $complaints[] = $row;
        }
        respond(['complaints' => $complaints]);
        break;

    case 'assign':
        $data = getInput();
        $complaintId = (int)($data['complaint_id'] ?? 0);
        $workerId = $db->real_escape_string($data['worker_id'] ?? '');
        $authorityId = (int)($data['authority_id'] ?? 0);
        $status = $db->real_escape_string($data['status'] ?? 'Assigned');

        // Get worker details
        $workerRes = $db->query("SELECT * FROM workers WHERE worker_id='$workerId'");
        if ($workerRes->num_rows === 0) respondError('Worker not found');
        $worker = $workerRes->fetch_assoc();

        $workerName = $db->real_escape_string($worker['name']);
        $workerPhone = $db->real_escape_string($worker['phone']);

        $db->query("UPDATE complaints SET status='$status', assigned_worker_id={$worker['id']}, assigned_worker_name='$workerName', assigned_worker_phone='$workerPhone', authority_id=$authorityId WHERE id=$complaintId");

        // Get complaint + user
        $comp = $db->query("SELECT c.*, u.first_name, u.last_name, u.email FROM complaints c JOIN users u ON c.user_id=u.id WHERE c.id=$complaintId")->fetch_assoc();
        $auth = $db->query("SELECT * FROM authorities WHERE id=$authorityId")->fetch_assoc();

        // Email user
        $emailBody = "Dear {$comp['first_name']},\n\nYour complaint has been updated.\n\nComplaint No: {$comp['complaint_no']}\nNew Status: $status\n\nAssigned Authority:\nName: {$auth['full_name']}\nEmail: {$auth['email']}\nPhone: {$auth['contact_no']}\nDesk: {$auth['desk_no']}\n\nAssigned Worker:\nName: $workerName\nPhone: $workerPhone\n\nBest regards,\nPublicWatch Team";
        sendEmail($comp['email'], "Complaint Status Update - {$comp['complaint_no']}", $emailBody);

        // Notify
        $msg = $db->real_escape_string("Your complaint {$comp['complaint_no']} status updated to: $status. Worker: $workerName ($workerPhone)");
        $db->query("INSERT INTO notifications (user_id,complaint_id,message) VALUES ({$comp['user_id']},$complaintId,'$msg')");

        respond(['message' => 'Complaint assigned']);
        break;

    case 'update_status':
        $data = getInput();
        $complaintId = (int)($data['complaint_id'] ?? 0);
        $status = $db->real_escape_string($data['status'] ?? '');
        $authorityId = (int)($data['authority_id'] ?? 0);

        $db->query("UPDATE complaints SET status='$status' WHERE id=$complaintId");
        $comp = $db->query("SELECT c.*, u.first_name, u.last_name, u.email FROM complaints c JOIN users u ON c.user_id=u.id WHERE c.id=$complaintId")->fetch_assoc();
        $auth = $db->query("SELECT * FROM authorities WHERE id=$authorityId")->fetch_assoc();

        $emailBody = "Dear {$comp['first_name']},\n\nStatus Update for Complaint: {$comp['complaint_no']}\nNew Status: $status\n\nAuthority: {$auth['full_name']}\nEmail: {$auth['email']}\nPhone: {$auth['contact_no']}\n\nBest regards,\nPublicWatch Team";
        sendEmail($comp['email'], "Complaint Status Updated - {$comp['complaint_no']}", $emailBody);

        $msg = $db->real_escape_string("Your complaint {$comp['complaint_no']} status updated to: $status");
        $db->query("INSERT INTO notifications (user_id,complaint_id,message) VALUES ({$comp['user_id']},$complaintId,'$msg')");

        respond(['message' => 'Status updated']);
        break;

    case 'stats':
        $dept = $db->real_escape_string($_GET['department'] ?? '');
        $where = $dept ? "WHERE department='$dept'" : '';
        $result = $db->query("SELECT status, COUNT(*) as count FROM complaints $where GROUP BY status");
        $stats = [];
        while ($row = $result->fetch_assoc()) $stats[$row['status']] = $row['count'];
        respond($stats);
        break;

    default:
        respondError('Invalid action', 404);
}
?>
