# TaskPilot 📋

A full-stack project management application built with modern web technologies. TaskPilot helps teams organize projects and manage tasks using an intuitive Kanban board interface with drag-and-drop functionality.

## 🚀 Live Demo

**Try it now:** [https://main.d3gxu1z7qiv7tn.amplifyapp.com](https://main.d3gxu1z7qiv7tn.amplifyapp.com)

- **Frontend**: AWS Amplify
- **Backend API**: AWS Elastic Beanstalk
- **Database**: MongoDB Atlas

![Build Status](https://img.shields.io/github/actions/workflow/status/davidjosipovic/task-pilot/ci.yml?branch=main&style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based authentication
- 📊 **Project Management** - Create, view, and delete projects
- ✅ **Kanban Board** - Visual task management with drag-and-drop
- 🎯 **Task CRUD** - Create, update, delete, and assign tasks
- 👥 **Team Collaboration** - Multi-user project access
- 🎨 **Modern UI** - Beautiful, responsive interface with TailwindCSS
- 🧪 **Fully Tested** - 35 comprehensive tests (100% passing)
- 🐳 **Docker Ready** - Containerized with Docker Compose
- ☁️ **Cloud Deployed** - Live on AWS (Amplify + Elastic Beanstalk)
- 🔄 **CI/CD Pipeline** - Automated testing and deployment with GitHub Actions

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - Server framework
- **Apollo Server** - GraphQL API
- **MongoDB** + **Mongoose** - Database
- **TypeScript** - Type safety
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Jest** - Testing framework

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Apollo Client** - GraphQL client
- **React Router** - Navigation
- **TailwindCSS** - Styling
- **React DnD** - Drag and drop
- **Vite** - Build tool
- **Vitest** - Testing framework

### DevOps & Cloud
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **AWS Amplify** - Frontend hosting & CI/CD
- **AWS Elastic Beanstalk** - Backend hosting
- **MongoDB Atlas** - Cloud database
- **GitHub Actions** - Automated testing & deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (or use Docker)
- npm or yarn

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/davidjosipovic/task-pilot.git
cd task-pilot

# Start all services with Docker Compose
docker compose up

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:4000/graphql
```

### Option 2: Local Development

#### Backend Setup
```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:4000`

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

#### Environment Variables

Create `.env` file in backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/taskpilot
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## 🧪 Testing

### Run All Tests
```bash
# Backend tests (21 tests)
cd backend
npm test

# Frontend tests (14 tests)
cd frontend
npm test

# With coverage
npm run test:coverage
```

### Test Coverage
- **35 total tests** - 100% passing ✅
- Backend: Authentication, Projects, Tasks
- Frontend: Components, Navigation, UI
- See [TESTING.md](./TESTING.md) for details

## 📁 Project Structure

```
task-pilot/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB models
│   │   ├── resolvers/       # GraphQL resolvers
│   │   ├── schemas/         # GraphQL schemas
│   │   ├── middleware/      # Auth middleware
│   │   └── __tests__/       # Test files
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   └── __tests__/       # Test files
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🎯 Key Features Explained

### Authentication
- JWT token-based authentication
- Secure password hashing with bcrypt
- Protected routes and API endpoints

### Kanban Board
- Drag and drop tasks between columns (TODO, DOING, DONE)
- Real-time status updates
- Visual feedback during drag operations

### Project Management
- Create multiple projects
- Add team members
- Delete projects (cascading task deletion)

## 🔧 Available Scripts

### Backend
- `npm start` - Start development server with hot reload
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run preview` - Preview production build

## 🐳 Docker Commands

```bash
# Start all services
docker compose up

# Start in detached mode
docker compose up -d

# Stop all services
docker compose down

# Rebuild containers
docker compose up --build

# View logs
docker compose logs -f

# Remove volumes (reset database)
docker compose down -v
```

## 📝 API Documentation

### GraphQL Endpoints

**Queries:**
- `getCurrentUser` - Get authenticated user
- `getProjects` - Get user's projects
- `getProject(id)` - Get project by ID
- `getTasksByProject(projectId)` - Get tasks for a project

**Mutations:**
- `registerUser(name, email, password)` - Register new user
- `loginUser(email, password)` - Login user
- `createProject(title, description)` - Create project
- `deleteProject(id)` - Delete project
- `createTask(projectId, title, description)` - Create task
- `updateTask(id, title, description, status)` - Update task
- `deleteTask(id)` - Delete task

## 🎨 UI/UX Features

- Modern gradient backgrounds
- Smooth animations and transitions
- Responsive design (mobile-friendly)
- Loading states and spinners
- Empty state messages
- Hover effects and visual feedback
- Color-coded status badges

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Protected GraphQL resolvers
- Authorization checks for CRUD operations
- CORS configuration

## 🚢 Deployment

### Production Deployment (AWS)

**Live Application**: [https://main.d3gxu1z7qiv7tn.amplifyapp.com](https://main.d3gxu1z7qiv7tn.amplifyapp.com)

#### Architecture:
- **Frontend**: AWS Amplify (auto-deploys from `main` branch)
- **Backend**: AWS Elastic Beanstalk (Docker)
- **Database**: MongoDB Atlas (M0 Free Tier)
- **CI/CD**: GitHub Actions (automated testing & deployment)

#### Deployment Workflow:
```
Push to GitHub (main)
  ↓
GitHub Actions CI/CD
  ↓ 
Run Tests (Jest + Vitest)
  ↓
Build Docker Images
  ↓
Deploy Backend to AWS EB
  ↓
Deploy Frontend to AWS Amplify
  ↓
🎉 Live!
```

### Manual Deployment

See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) for detailed deployment instructions.

### Environment Variables (Production)
```env
MONGO_URI=***REMOVED***
- Portfolio: [https://main.d3gxu1z7qiv7tn.amplifyapp.com](https://main.d3gxu1z7qiv7tn.amplifyapp.com)

## 🙏 Acknowledgments

- Built with modern best practices and industry standards
- Inspired by Trello and Jira
- Comprehensive testing approach with 100% passing tests
- Production-ready architecture deployed on AWS
- Automated CI/CD pipeline with GitHub Actions

---

**⭐ If you find this project useful, please consider giving it a star!**

