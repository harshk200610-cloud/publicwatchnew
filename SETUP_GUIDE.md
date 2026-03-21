# PublicWatch — Complete Setup Guide
## Vasai-Virar City Municipal Corporation

---

## 🗂️ PROJECT STRUCTURE

```
publicwatch/
├── frontend/          ← Citizen React App (Port 3000)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.js
│   │   ├── api.js
│   │   ├── assets/logo.jpeg
│   │   ├── context/AuthContext.jsx
│   │   ├── styles/main.css
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── PostCard.jsx
│   │   └── pages/
│   │       ├── Landing.jsx
│   │       ├── Auth.jsx
│   │       ├── Feed.jsx
│   │       ├── Report.jsx
│   │       └── MyComplaints.jsx
│   ├── public/index.html
│   └── package.json
│
├── gov-portal/        ← Government React App (Port 3001)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.js
│   │   ├── api.js
│   │   ├── context/GovAuthContext.jsx
│   │   ├── styles/gov.css
│   │   ├── components/GovSidebar.jsx
│   │   └── pages/
│   │       ├── GovLanding.jsx
│   │       ├── GovAuth.jsx
│   │       └── GovDashboard.jsx
│   ├── public/index.html
│   └── package.json
│
├── backend/           ← PHP API Server (Port 8000)
│   ├── api/
│   │   ├── auth.php
│   │   ├── complaints.php
│   │   └── authority.php
│   ├── config/
│   │   ├── db.php
│   │   └── helpers.php
│   └── uploads/       ← Auto-created for images
│
└── database.sql       ← MySQL schema + 500+ workers
```

---

## ✅ PREREQUISITES

Install these first:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| PHP | 8.0+ | https://www.php.net |
| MySQL | 8.0+ | https://dev.mysql.com/downloads/ |
| Git | Any | https://git-scm.com |

**Quick check (run in terminal):**
```bash
node --version    # Should show v18+
php --version     # Should show PHP 8.0+
mysql --version   # Should show MySQL 8.0+
```

---

## 🗄️ STEP 1: Set Up MySQL Database

### 1.1 Start MySQL and log in
```bash
# macOS (Homebrew)
brew services start mysql
mysql -u root -p

# Ubuntu/Linux
sudo systemctl start mysql
sudo mysql -u root -p

# Windows
# Start MySQL from Services or XAMPP Control Panel
mysql -u root -p
```

### 1.2 Create database and import schema
```bash
# In terminal (not MySQL shell):
mysql -u root -p < /path/to/publicwatch/database.sql

# OR inside MySQL shell:
source /path/to/publicwatch/database.sql;
```

### 1.3 Verify the import
```sql
USE publicwatch;
SHOW TABLES;
-- Should show: users, authorities, workers, complaints, comments, upvotes, notifications, escalations

SELECT COUNT(*) FROM workers;
-- Should show: 505+

SELECT worker_id, name, department FROM workers LIMIT 5;
```

---

## ⚙️ STEP 2: Configure PHP Backend

### 2.1 Update database credentials
Open `backend/config/db.php` and edit:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');        // Your MySQL username
define('DB_PASS', 'yourpassword'); // Your MySQL password
define('DB_NAME', 'publicwatch');
```

### 2.2 Create uploads directory (auto-created, but check permissions)
```bash
mkdir -p publicwatch/backend/uploads
chmod 755 publicwatch/backend/uploads
```

### 2.3 Start PHP built-in server
```bash
# Navigate to the project root
cd /path/to/publicwatch

# Start PHP server on port 8000
php -S localhost:8000 -t backend

# You should see:
# PHP 8.x Development Server (http://localhost:8000) started
```

### 2.4 Test the backend
Open browser: `http://localhost:8000/api/auth.php?action=test`
Should return a JSON response (even if error, confirms PHP is running).

Or test with curl:
```bash
curl http://localhost:8000/api/complaints.php?action=feed
```

---

## ⚛️ STEP 3: Set Up Citizen Frontend (Port 3000)

### 3.1 Navigate and install
```bash
cd publicwatch/frontend
npm install
```

### 3.2 Start the React app
```bash
npm start
# Opens automatically at http://localhost:3000
```

### 3.3 The citizen app will show:
- **Splash Screen** → PublicWatch logo animation (3 seconds)
- **Landing Page** → Purpose, features, Login/Register buttons
- **Register** → Create citizen account
- **Login** → Sign in (username = email)
- **Feed** → All community complaint posts
- **Report** → Submit a complaint with map
- **My Complaints** → Track your submissions

---

## 🏛️ STEP 4: Set Up Government Portal (Port 3001)

### 4.1 Navigate and install
```bash
cd publicwatch/gov-portal
npm install
```

### 4.2 Start the government portal
```bash
npm start
# Opens at http://localhost:3001
```

### 4.3 The government portal will show:
- **Landing Page** → VVCMC official portal design
- **Register Authority** → Create official account (gets VVCMC ID via email)
- **Login** → Using VVCMC ID + password
- **Dashboard** → Department-specific stats and complaint management

---

## 🌐 STEP 5: Access Your Application

| Portal | URL | Users |
|--------|-----|-------|
| **Citizen Portal** | http://localhost:3000 | Public citizens |
| **Government Portal** | http://localhost:3001/gov | VVCMC Officials |
| **PHP API** | http://localhost:8000/api | Backend (internal) |
| **Uploaded Images** | http://localhost:8000/backend/uploads/ | Served by PHP |

---

## 🧪 STEP 6: Test the Full Workflow

### 6.1 Create a citizen account
1. Go to http://localhost:3000/register
2. Fill in all details
3. Account created → Check email_log.txt in backend folder for the welcome email

### 6.2 Submit a complaint
1. Login → Go to "Report" tab
2. Fill in: Department (e.g., Health/Sanitation), Subject, Description
3. Click on the map to pin location → Coordinates + address auto-fill
4. Upload an image (optional)
5. Solve CAPTCHA → Submit
6. Complaint appears immediately in Feed

### 6.3 Create a government authority account
1. Go to http://localhost:3001/gov/register
2. Fill in name, email (yourname@vvcmcgov.in), department (e.g., Health/Sanitation Department)
3. Submit → Check email_log.txt for VVCMC ID
4. Note the VVCMC ID (format: VVCMCID12345)

### 6.4 Log in as authority and manage complaints
1. Go to http://localhost:3001/gov/login
2. Enter VVCMC ID and password
3. Dashboard shows all complaints from your department
4. Click "Assign" on a complaint → Enter a worker ID (e.g., WRK021 for Health/Sanitation)
5. Click "Lookup" → Name and phone auto-fill
6. Click "Assign & Notify User" → User gets notified via email

---

## 👷 STEP 7: Worker Management

### Find workers for a department
```sql
-- In MySQL:
USE publicwatch;
SELECT worker_id, name, phone FROM workers WHERE department = 'Health/Sanitation Department' LIMIT 10;
```

### Worker IDs by department (sample):
| Department | Sample Worker IDs |
|-----------|------------------|
| Health/Sanitation | WRK021–WRK035, WRK283 |
| PWD Department | WRK036–WRK050, WRK258 |
| Water supply | WRK156–WRK175 |
| Electricity | WRK176–WRK190 |
| Fire brigade | WRK061–WRK075 |
| Property Tax | WRK001–WRK010 |
| Construction | WRK141–WRK155 |
| Medical Health | WRK221–WRK235 |

### To Add a Worker (via UI):
1. Login to Gov Portal
2. Click "Workers Management" in sidebar
3. Click "+ Add Worker"
4. Enter: Worker ID (e.g., WRK506), Name, Phone
5. Click "Add Worker" — auto-assigned to your department

### To Add a Worker (via SQL):
```sql
INSERT INTO workers (worker_id, name, phone, department) VALUES
('WRK506', 'New Worker Name', '9876543506', 'Health/Sanitation Department');
```

### To Delete a Worker (via UI):
1. Go to Workers Management
2. Search for the worker
3. Click "Delete" → Confirm

### To Delete a Worker (via SQL):
```sql
DELETE FROM workers WHERE worker_id = 'WRK506';
```

---

## 📧 Email System

In development, emails are logged to `backend/email_log.txt`.

### To enable real email sending (Production):
1. Install PHPMailer: `composer require phpmailer/phpmailer`
2. Update `backend/config/helpers.php`:
```php
use PHPMailer\PHPMailer\PHPMailer;

function sendEmail($to, $subject, $body) {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'your@gmail.com';
    $mail->Password   = 'your-app-password';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->setFrom('noreply@publicwatch.in', 'PublicWatch');
    $mail->addAddress($to);
    $mail->Subject    = $subject;
    $mail->Body       = $body;
    $mail->send();
    return true;
}
```

---

## 🛠️ TROUBLESHOOTING

### "Connection error" on login/register:
- Make sure PHP server is running: `php -S localhost:8000 -t backend`
- Check backend/config/db.php credentials match your MySQL

### Map not loading:
- OpenStreetMap (Leaflet) requires internet connection
- If offline, the map shows grey tiles but pins still work

### Images not showing in feed:
- Make sure PHP server is on port 8000
- Check `backend/uploads/` exists and has permissions

### CORS errors in browser console:
- PHP backend includes CORS headers automatically
- Make sure you're using the PHP server (not opening .php files directly)

### Database errors:
```bash
# Check MySQL is running
sudo systemctl status mysql   # Linux
brew services list            # macOS

# Reset and reimport
mysql -u root -p -e "DROP DATABASE publicwatch;"
mysql -u root -p < database.sql
```

---

## 🚀 Running All Three Servers

Open **3 separate terminals**:

**Terminal 1 — PHP Backend:**
```bash
cd publicwatch
php -S localhost:8000 -t backend
```

**Terminal 2 — Citizen Frontend:**
```bash
cd publicwatch/frontend
npm start
```

**Terminal 3 — Government Portal:**
```bash
cd publicwatch/gov-portal
npm start
```

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `database.sql` | Full schema + 500+ workers — run once |
| `backend/config/db.php` | MySQL credentials — edit first |
| `backend/config/helpers.php` | Email logic |
| `backend/api/auth.php` | User login/register API |
| `backend/api/complaints.php` | Complaints CRUD + feed API |
| `backend/api/authority.php` | Gov auth + workers API |
| `frontend/src/api.js` | All API calls from citizen app |
| `gov-portal/src/api.js` | All API calls from gov portal |
| `backend/email_log.txt` | Email log (created automatically) |

---

## 📞 Support

- Citizen Portal: http://localhost:3000
- Government Portal: http://localhost:3001/gov
- Backend API: http://localhost:8000/api

**PublicWatch — Empowering Citizens. Improving Cities.**
Vasai-Virar City Municipal Corporation
