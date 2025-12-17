# 🌱 EcoTrack Server

## About

**Backend API for EcoTrack - A community sustainability platform with RESTful endpoints for challenges, tips, events, and user progress tracking.**

🔗 **Live API:** [eco-track-server-eight.vercel.app/api](https://eco-track-server-eight.vercel.app/api)

**Technologies:** `nodejs` `expressjs` `mongodb` `firebase-admin` `vercel`

---

EcoTrack is a full-stack sustainability challenge platform that empowers users to participate in eco-friendly activities, track their impact, and engage with a community. Built with React, Express, Firebase Authentication, and MongoDB.

---

## 🚀 Features

- 🔐 Firebase-authenticated user flows with secure token verification
- 🧩 Modular backend routes for challenges, tips, events, and user dashboards
- 📊 RESTful APIs for filtering, joining, and managing challenges
- 🛡️ Role-based access control for admins and content creators
- 🎨 Responsive frontend with dynamic cards, forms, and layouts

---

## 🛠️ Tech Stack

### Client

- React + Vite
- Firebase Auth
- Axios
- Tailwind CSS
- React Router

### Server

- Node.js + Express
- MongoDB (native driver)
- Firebase Admin SDK
- dotenv

> 🔗 **Client Repository:** [EcoTrack-Client](https://github.com/shamim0183/EcoTrack-Client)

---

## 📂 Project Structure

```
server/
├── routes/                    # API route handlers
│   ├── challenges.js          # Challenge CRUD & filtering
│   ├── userChallenges.js      # Join & track progress
│   ├── tips.js                # Eco tips management
│   ├── events.js              # Event management
│   ├── user.js                # User profile & activities
│   ├── dashboard.js           # Dashboard stats & metrics
│   └── homeRoutes.js          # Home page aggregated data
├── db.js                      # MongoDB connection
├── firebaseAdmin.js           # Firebase Admin SDK setup
├── firebaseAuth.js            # Firebase authentication helpers
├── index.js                   # Express server entry point
├── vercel.json                # Vercel deployment config
├── .env                       # Environment variables
└── package.json               # Dependencies
```
