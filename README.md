# TaskPilot 📋

A modern, full-stack project management application with Kanban boards, team collaboration, and secure authentication. Built with React, Node.js, GraphQL, and MongoDB.

## 🚀 Live Demo

**Production:** [https://taskpilot.up.railway.app](https://taskpilot.up.railway.app)

- **Frontend**: Railway (Docker)
- **Backend API**: Railway (Docker)
- **Database**: MongoDB Atlas

![Tech Stack](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

## ✨ Features

### Core Features
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 📊 **Project Management** - Create, organize, and archive projects
- ✅ **Kanban Board** - Drag-and-drop task management (TODO → DOING → DONE)
- 🎯 **Task Management** - Full CRUD with priority, due dates, and tags
- 🏷️ **Custom Tags** - Color-coded tags for task organization
- 👥 **Team Collaboration** - Multi-user project access with proper authorization
- 📦 **Archive System** - Archive projects with read-only mode
- 🌙 **Dark Mode** - Beautiful dark theme with smooth transitions
- 📱 **Fully Responsive** - Mobile-first design with hamburger menu

### Technical Features
- � **Security Hardened** - Helmet.js, rate limiting, input validation
- � **Performance** - Apollo Client caching, optimized queries
- 🧪 **Well Tested** - Comprehensive test coverage with Jest & Vitest
- � **Structured Logging** - Winston logging with monitoring dashboard
- 🐳 **Production Ready** - Docker deployment with health checks
- ⚡ **Modern Stack** - React 19, Vite, TypeScript, GraphQL

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest UI library
- **TypeScript** - Type safety
- **Apollo Client** - GraphQL state management
- **TailwindCSS 4** - Modern styling
- **React Router** - Navigation
- **React DnD** - Drag and drop functionality
- **Vite 7** - Lightning-fast build tool

### Backend
- **Node.js 20** - Runtime
- **Express** - Web framework
- **Apollo Server** - GraphQL API
- **MongoDB + Mongoose** - Database
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Winston** - Structured logging
- **Helmet** - Security headers
- **Express Rate Limit** - DDoS protection

### DevOps
- **Docker** - Containerization
- **Railway** - Cloud deployment platform
- **MongoDB Atlas** - Managed database
- **GitHub** - Version control

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- MongoDB (or use Docker)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/davidjosipovic/task-pilot.git
cd task-pilot
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017/taskpilot
JWT_SECRET=dev_secret_key_for_local_development
PORT=4000
NODE_ENV=development
EOF

# Start backend
npm run dev
```

Backend runs on `http://localhost:4000/graphql`

3. **Frontend Setup**
```bash
cd frontend
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:4000/graphql
EOF

# Start frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

### Docker Development

```bash
# Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use full Docker Compose setup (if available)
docker compose up
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Frontend tests
cd frontend
npm test                # Run all tests
npm run test:ui         # Interactive UI
```

## 📁 Project Structure

```
task-pilot/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose models (User, Project, Task, Tag)
│   │   ├── resolvers/       # GraphQL resolvers
│   │   ├── schemas/         # GraphQL type definitions
│   │   ├── middleware/      # Auth, logging, CORS
│   │   ├── utils/           # Logger, dashboard handler
│   │   ├── plugins/         # Apollo plugins
│   │   └── __tests__/       # Backend tests
│   ├── Dockerfile           # Production Docker build
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Auth & Theme context
│   │   └── __tests__/       # Frontend tests
│   ├── Dockerfile           # Production Docker build
│   ├── server.cjs           # Production server
│   └── package.json
│
└── README.md
```

## 🔐 Security Features

### Implemented Security Measures
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **HTTP Security Headers** - Helmet.js protection
- ✅ **Rate Limiting** - 100 req/15min general, 5 req/15min auth
- ✅ **Input Validation** - Email regex, password strength (8+ chars)
- ✅ **CORS Protection** - Whitelist only Railway domains
- ✅ **Authorization Checks** - Project membership validation
- ✅ **Session Management** - Token refresh on login/logout
- ✅ **Environment Secrets** - Required JWT_SECRET in production
- ✅ **SQL Injection Prevention** - MongoDB parameterized queries

### Security Best Practices
- Passwords never logged or exposed
- Sensitive data filtered from logs
- HTTPS enforced in production
- Health checks don't expose sensitive info
- Docker runs as non-root user

## � API Documentation

### GraphQL Endpoints

#### Queries
```graphql
# User
getCurrentUser: User

# Projects
getProjects: [Project!]!              # Active projects
getArchivedProjects: [Project!]!      # Archived projects
getProject(id: ID!): Project

# Tasks & Tags
getTasksByProject(projectId: ID!): [Task!]!
getTagsByProject(projectId: ID!): [Tag!]!
```

#### Mutations
```graphql
# Authentication
registerUser(name: String!, email: String!, password: String!): AuthPayload!
loginUser(email: String!, password: String!): AuthPayload!

# Projects
createProject(title: String!, description: String): Project!
deleteProject(id: ID!): Boolean!
archiveProject(id: ID!): Project!
unarchiveProject(id: ID!): Project!

# Tasks
createTask(projectId: ID!, title: String!, description: String, 
           priority: String, dueDate: String, tagIds: [ID!]): Task!
updateTask(id: ID!, title: String, description: String, 
           status: String, priority: String, dueDate: String, 
           tagIds: [ID!]): Task!
deleteTask(id: ID!): Boolean!

# Tags
createTag(projectId: ID!, name: String!, color: String): Tag!
updateTag(id: ID!, name: String, color: String): Tag!
deleteTag(id: ID!): Boolean!
```

## 🎨 UI/UX Features

- **Modern Design** - Gradient backgrounds, smooth animations
- **Dark Mode** - Full dark theme support with context persistence
- **Responsive Layout** - Mobile hamburger menu, flexible grids
- **Drag & Drop** - Intuitive Kanban board interaction
- **Loading States** - Spinners, skeletons, optimistic updates
- **Empty States** - Helpful messages and icons
- **Toast Notifications** - Success/error feedback
- **Accessibility** - ARIA labels, keyboard navigation

## � Logging & Monitoring

### Log Levels
- `error` - Critical errors
- `warn` - Warnings and recoverable issues
- `info` - Important events (login, CRUD operations)
- `debug` - Detailed debugging info

### Log Files (Backend)
```
backend/logs/
  ├── combined.log    # All logs
  └── error.log       # Errors only
```

### Monitoring Dashboard
Access real-time logs and metrics:
```
Development: http://localhost:4000/monitoring
Production: https://your-backend.railway.app/monitoring
```

## 🚢 Deployment

### Railway Deployment

This project is deployed on [Railway](https://railway.app) using Docker.

#### Environment Variables Required

**Backend (Railway)**
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=<generate-strong-random-32+-char-string>
NODE_ENV=production
PORT=<auto-provided-by-railway>
```

**Frontend (Railway)**
```env
VITE_API_URL=https://your-backend.railway.app/graphql
PORT=<auto-provided-by-railway>
```

#### Deployment Process
1. Push to GitHub `main` branch
2. Railway auto-detects Dockerfile
3. Builds Docker image with build args (VITE_API_URL for frontend)
4. Deploys to production
5. Health checks ensure service is running

## 🔧 Available Scripts

### Backend
```bash
npm run dev          # Development with hot reload (ts-node-dev)
npm start            # Production (node dist/index.js)
npm run build        # Compile TypeScript to JavaScript
npm test             # Run tests
npm run test:watch   # Tests in watch mode
npm run test:coverage # Coverage report
```

### Frontend
```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm test             # Run tests
npm run test:ui      # Vitest UI
```

## 🐳 Docker

### Development
```bash
# Start MongoDB
docker run -d -p 27017:27017 mongo:latest
```

### Production (Railway)
```dockerfile
# Multi-stage build with node:20-alpine
# Frontend: Build React → Serve with 'serve' package
# Backend: Build TypeScript → Run with Node.js
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**David Josipović**
- GitHub: [@davidjosipovic](https://github.com/davidjosipovic)

## 🙏 Acknowledgments

- React DnD for drag-and-drop functionality
- TailwindCSS for modern styling
- Apollo GraphQL for powerful API layer
- Railway for seamless deployment

---

**⭐ If you find this project useful, please give it a star!**
