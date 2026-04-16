# PublicWatch

## Overview

PublicWatch is a full-stack web-based civic issue reporting and management platform designed to connect citizens with municipal authorities. It enables users to report infrastructure problems with images and precise location, while authorities can manage, assign, and resolve complaints efficiently.

The system follows a real-time, transparent workflow where reported issues are instantly visible in a social-media-style feed and tracked through different resolution stages.

---

## Features

### Citizen Side

* User registration and login
* Email confirmation after account creation
* Report issues with:

  * Title and description
  * Department selection
  * Multiple image uploads
  * Map-based location (latitude & longitude)
* Feed page displaying complaints as posts
* Upvote and comment functionality
* Real-time complaint status tracking
* Raise alerts for unresolved issues

### Government Authority Side

* Separate admin portal
* Authority registration with department allocation
* Unique ID generation for login
* Dashboard showing department-specific complaints
* Worker assignment system
* Status updates (Reported → In Progress → Completed)
* Automatic notifications to users

---

## Tech Stack

### Frontend

* React.js
* CSS (Flexbox & Grid)
* Map Integration (MapTiler SDK / APIs)

### Backend

* PHP (REST API handling)

### Database

* MySQL

### Other Tools

* Email Service (SMTP)
* CAPTCHA for spam protection

---

## System Architecture

PublicWatch follows a 3-tier architecture:

1. **Presentation Layer** (React)
2. **Application Layer** (PHP APIs)
3. **Data Layer** (MySQL Database)

---

## Project Structure

```
publicwatch/
│
├── frontend/ (React)
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── styles/
│
├── backend/ (PHP)
│   ├── api/
│   ├── config/
│   └── uploads/
│
├── database/
│   └── schema.sql
```

---

## Installation & Setup

### 1. Clone Repository

```
git clone https://github.com/your-username/publicwatch.git
cd publicwatch
```

---

### 2. Frontend Setup

```
cd frontend
npm install
npm start
```

Runs on:

```
http://localhost:3000
```

---

### 3. Backend Setup (PHP)

1. Install XAMPP or WAMP
2. Move backend folder to:

```
htdocs/publicwatch
```

3. Start Apache & MySQL from control panel

---

### 4. Database Setup

1. Open phpMyAdmin
2. Create database:

```
publicwatch_db
```

3. Import:

```
database/schema.sql
```

---

### 5. Configure Database Connection

Edit:

```
backend/config/db.php
```

Set:

```
host = localhost
username = root
password = ""
database = publicwatch_db
```

---

## Running the Project

Frontend:

```
npm start
```

Backend:

```
http://localhost/publicwatch/backend/api/
```

---

## Workflow

### Citizen Flow

Landing Page → Signup → Email Confirmation → Login → Feed → Report Issue → Submit → Appears in Feed → Status Updates

### Authority Flow

Login → Dashboard → View Complaints → Assign Worker → Update Status → Notify User

---

## Database Tables

* users
* complaints
* complaint_images
* departments
* authorities
* workers
* comments
* votes
* status_logs

---

## Key Functionalities

* Map-based complaint reporting
* Real-time feed updates
* Department-based routing
* Worker assignment system
* Email notification system
* Complaint lifecycle tracking

---

## Future Enhancements

* Mobile application (React Native)
* AI-based complaint classification
* Predictive maintenance analytics
* Push notifications
* Integration with smart city IoT systems

---

## Contributing

Contributions are welcome. Fork the repository and submit a pull request.

---

## License

This project is developed for academic purposes.

---

## Author

Harsh Deepak Kamble

---

## Tagline

Empowering Citizens. Improving Cities.
