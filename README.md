# 🚀 QueueLess — Online Queue & Appointment Manager

A production-ready, full-stack smart queue management system with real-time updates. Join queues online, track your position live, and get notified when it's your turn.

![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-black?logo=socket.io)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)

---

## 🔗 Live Deployments

- **Frontend (Vercel)**: [https://thulasishylasri-queueless.vercel.app](https://thulasishylasri-queueless.vercel.app)
- **Backend API (Render)**: [https://queueless-backend.onrender.com](https://queueless-backend.onrender.com) (Example, depends on actual Render subdomain)
- **GitHub Repository**: [https://github.com/2303A51876/SESD-1876-BT-14](https://github.com/2303A51876/SESD-1876-BT-14)

---

## 📋 Features

### User Features
- ✅ Public registration & JWT login
- ✅ Browse available services (Bank, Hospital, Government Office)
- ✅ Join queues with auto-generated token numbers
- ✅ Real-time queue position tracking (Socket.io)
- ✅ Toast notifications when turn is called
- ✅ View token number, position, current serving token

### Admin Features
- ✅ Pre-created admin account (cannot register via UI)
- ✅ Dashboard analytics: total users, active queues, completed
- ✅ Service CRUD (add, edit, delete)
- ✅ Queue management: call next, mark complete
- ✅ Charts (Bar + Doughnut via Chart.js)

### Security
- ✅ JWT-based authentication
- ✅ bcrypt password hashing
- ✅ Role-based access control (user/admin)
- ✅ Protected admin routes
- ✅ No credentials exposed in UI

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js 20+, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Real-Time | Socket.io |
| Charts | Chart.js + react-chartjs-2 |
| DevOps | Docker, docker-compose, GitHub Actions |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+**
- **MongoDB** running locally (or Docker)

### Local Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd queueless1876

# 2. Backend
cd backend
cp .env.example .env    # Edit env vars if needed
npm install
npm run dev
# Server runs at http://localhost:5000
# Database auto-seeds on first run

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### Docker Setup

```bash
docker compose up --build
# App available at http://localhost
```

### ☁️ Cloud Deployment (Vercel & Render)

**Frontend (Vercel):**
1. Connect this GitHub repository to your Vercel account.
2. Ensure the framework preset is set to **Vite**.
3. Set Environment Variable: `VITE_API_URL` = `https://<your-render-url>.onrender.com/api`
4. Deploy! (Routing is automatically handled by the included `vercel.json`).

**Backend (Render):**
1. Connect this GitHub repository to Render and create a **Web Service**.
2. The included `render.yaml` Blueprint will automatically run `npm install` and `npm start`.
3. Set the following Environment Variables in the Render dashboard:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string for JWT signatures.
   - `FRONTEND_URL`: `https://thulasishylasri-queueless.vercel.app`
4. Deploy!

---

## 📁 Project Structure

```
queueless1876/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # Navbar, ProtectedRoute, LoadingSpinner
│   │   ├── context/          # AuthContext, SocketContext
│   │   ├── pages/            # Home, Login, Register, UserDashboard, AdminDashboard
│   │   ├── services/         # Axios API layer
│   │   └── ...
│   └── ...
├── backend/                  # Express.js API
│   ├── config/               # db.js, seed.js
│   ├── controllers/          # auth, service, queue
│   ├── middleware/            # JWT auth, role guard
│   ├── models/               # User, Service, Queue
│   ├── routes/               # API routes
│   └── server.js             # Entry point + Socket.io
├── docker/                   # Dockerfiles + nginx config
├── .github/workflows/        # CI/CD pipeline
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register (user role only) |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Current user profile |

### Services
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/services` | Public | List all services |
| POST | `/api/services` | Admin | Create service |
| PUT | `/api/services/:id` | Admin | Update service |
| DELETE | `/api/services/:id` | Admin | Delete service |

### Queue
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/queue/join` | User | Join a queue |
| GET | `/api/queue/status` | User | My queue status |
| GET | `/api/queue/:serviceId` | Admin | Service queue |
| PUT | `/api/queue/next` | Admin | Call next token |
| PUT | `/api/queue/complete` | Admin | Complete token |
| GET | `/api/queue/admin/stats` | Admin | Dashboard stats |

---

## 🔄 Real-Time Events (Socket.io)

| Event | Direction | Description |
|-------|-----------|-------------|
| `joinQueue` | Client → Server | Join service room |
| `queueUpdated` | Server → Client | Queue state changed |
| `nextTokenCalled` | Server → Client | Admin called next token |

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend server port |
| `MONGO_URI` | `mongodb://localhost:27017/queueless` | MongoDB connection |
| `JWT_SECRET` | *required* | JWT signing key |
| `NODE_ENV` | `development` | Environment |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL (CORS) |

Docker uses: `MONGO_URI=mongodb://mongo:27017/queless`

---

## 🔐 Access Control

| Role | Registration | Dashboard | Capabilities |
|------|-------------|-----------|-------------|
| User | Public signup | `/user-dashboard` | Join queues, track position |
| Admin | Pre-created only | `/admin-dashboard` | Manage services, control queues |

---

## 📝 License

MIT License — Open source and free to use.

---

Built with ❤️ by **Thulasi Shylasri**
