# Team Task Manager

A full-stack web application for managing projects and tasks with role-based access control.

## Live Demo

- **Frontend:** https://your-frontend-url.railway.app
- **Backend API:** https://your-backend-url.railway.app

---

## Features

- **Authentication** — Signup and Login with JWT tokens
- **Role-Based Access Control** — Admin and Member roles with different permissions
- **Project Management** — Create, view, update and delete projects
- **Task Management** — Create tasks with title, description, priority, due date and assignee
- **Kanban Board** — Visual task board with To Do, In Progress and Done columns
- **Dashboard** — Overview of tasks, projects and progress stats
- **Overdue Detection** — Tasks past due date are highlighted in red
- **Responsive Design** — Works on desktop and mobile

---

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- JSON Web Tokens (JWT)
- bcryptjs

### Deployment
- Railway (both frontend and backend)
- Railway PostgreSQL plugin

---

## Role-Based Access Control

| Action | Admin | Member |
|---|---|---|
| Create project | Yes | No |
| Delete project | Yes | No |
| Create task | Yes | Yes |
| Edit task (all fields) | Yes | No |
| Update task status | Yes | Yes |
| Delete task | Yes | No |
| View dashboard | Yes | Yes |
| View projects | Yes | Yes |

---

## API Endpoints

### Auth
- `POST /api/auth/signup` — Create a new account
- `POST /api/auth/login` — Login to existing account
- `GET /api/auth/me` — Get current logged in user

### Projects
- `GET /api/projects` — Get all projects
- `POST /api/projects` — Create a new project (Admin only)
- `GET /api/projects/:id` — Get single project with tasks
- `PUT /api/projects/:id` — Update project (Admin only)
- `DELETE /api/projects/:id` — Delete project (Admin only)

### Tasks
- `GET /api/tasks` — Get all tasks
- `GET /api/tasks/project/:projectId` — Get tasks by project
- `POST /api/tasks` — Create a new task
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task (Admin only)

### Users
- `GET /api/users` — Get all users (for task assignment)

---

## Database Schema

### Users
- id, name, email, password, role (admin/member), createdAt, updatedAt

### Projects
- id, name, description, owner_id (FK → Users), createdAt, updatedAt

### Tasks
- id, title, description, status (todo/in_progress/done), priority (low/medium/high), due_date, project_id (FK → Projects), assignee_id (FK → Users), createdAt, updatedAt

---

## Getting Started Locally

### Prerequisites
- Node.js v18+
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/iashutoshrana/team-task-manager.git
cd team-task-manager
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```env
PORT=5000
JWT_SECRET=taskmanager_secret_key_2024
DB_NAME=taskmanager
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
```

Create the database in PostgreSQL:

```sql
CREATE DATABASE taskmanager;
```

Start the backend server:

```bash
npm run dev
```

Backend runs on: http://localhost:5000

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

---

## Deployment on Railway

### Backend Service
1. Create new service from GitHub repo
2. Set Root Directory to `backend`
3. Add environment variables:
   - `JWT_SECRET` = your secret key
   - `DB_NAME` = `${{Postgres.PGDATABASE}}`
   - `DB_USER` = `${{Postgres.PGUSER}}`
   - `DB_PASSWORD` = `${{Postgres.PGPASSWORD}}`
   - `DB_HOST` = `${{Postgres.PGHOST}}`
   - `DB_PORT` = `${{Postgres.PGPORT}}`
4. Add PostgreSQL plugin from Railway dashboard

### Frontend Service
1. Create new service from same GitHub repo
2. Set Root Directory to `frontend`
3. Add environment variable:
   - `VITE_API_URL` = your Railway backend URL + `/api`

---

## Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   ├── Task.js
│   │   │   └── index.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   ├── tasks.js
│   │   │   └── users.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── index.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   └── ProjectDetail.jsx
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## Author

Ashutosh Rana  
GitHub: [@iashutoshrana](https://github.com/iashutoshrana)
