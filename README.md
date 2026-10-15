# AI-Powered Task Management & Bug Tracking System 🚀

An intelligent full-stack task management and bug tracking system with automated Machine Learning (NLP) classification and time estimation.

---

## 🌟 Key Features
- **Auto Classification:** Automatically detects whether an entered ticket is a **Bug** or a **Feature** using a trained Scikit-Learn NLP model.
- **AI Estimation:** Provides estimated resolution time based on ticket description.
- **Kanban / Task Lifecycle:** Update task statuses (`To-Do`, `In-Progress`, `Done`), search, filter, and delete tasks.
- **Full-Stack Architecture:** Connected Next.js UI, Node.js REST API, MySQL database, and Python Flask microservice.

---

## 🛠️ Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS, Lucide Icons
- **Backend API:** Node.js, Express.js
- **Database:** MySQL
- **AI Service:** Python, Flask, Scikit-Learn, Joblib

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- Python 3.9+
- MySQL Server

### 2. Database Setup
Create database `task_management_db` and a `tasks` table in MySQL:
```sql
CREATE DATABASE task_management_db;
USE task_management_db;

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'Feature',
    status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Backend Setup
```bash
cd frontend-task-app/backend-task-app
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
node server.js
```

### 4. AI Service Setup
```bash
cd ai-service
pip install flask flask-cors scikit-learn joblib
python train_model.py
python app.py
```

### 5. Frontend Setup
```bash
cd frontend-task-app
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
