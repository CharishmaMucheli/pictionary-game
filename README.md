🎨 Real-Time Multiplayer Pictionary Game

A **real-time online multiplayer Pictionary game** inspired by *Gartic.io*, built using the **MERN stack** and **Socket.io**.
The application enables users to create or join rooms, draw collaboratively on a shared canvas, guess words in real time, and compete using a turn-based scoring system.

## 🚀 Features

* 🔐 **Room-based multiplayer gameplay** (2–8 players per room)
* 🎨 **Live synchronized drawing canvas** using WebSockets
* 💬 **Real-time chat & guessing system**
* ⏱️ **Turn-based rounds with countdown timers**
* 🔄 **Automatic turn rotation & word assignment**
* 🏆 **Real-time score updates**
* 📱 **Responsive UI** built with React & CSS
* ☁️ **Frontend deployed on Vercel** for scalable delivery

---

## 🧱 Tech Stack

### Frontend

* **React.js** – Component-based UI
* **Socket.io Client** – Real-time communication
* **HTML5 Canvas** – Drawing surface
* **CSS** – Responsive styling

### Backend

* **Node.js** – Runtime environment
* **Express.js** – REST API layer
* **Socket.io** – WebSocket-based real-time engine
* **MongoDB + Mongoose** – Persistent data storage

---

## 🏗️ System Architecture

```
Browser (React)
 ├── REST APIs (Axios)
 └── WebSocket (Socket.io)

Node.js + Express Server
 ├── REST APIs (Auth, Rooms)
 ├── Socket.io Server (Realtime Events)
 ├── Game Logic Engine (Turns, Timer, Scoring)
 └── MongoDB (Users, Rooms, Stats)
```

### Why This Architecture?

* **REST APIs** handle authentication and room metadata
* **WebSockets** handle high-frequency real-time events (drawing, chat, timers)
* **In-memory game state** ensures low-latency gameplay
* **MongoDB** persists long-term data like users and statistics

---

## 🗄️ Database Schema (MongoDB)

### User

```js
{
  username: String,
  email: String,
  password: String,
  avatar: String,
  stats: {
    gamesPlayed: Number,
    wins: Number,
    score: Number
  }
}
```

### Room

```js
{
  roomCode: String,
  isActive: Boolean
}
```

> ⚠️ **Note:** Real-time game state (current word, timer, players) is stored **in memory** for performance, while MongoDB stores persistent data.

---

## 🔌 WebSocket Event Flow

### Client → Server

| Event         | Description               |
| ------------- | ------------------------- |
| `join-room`   | Join or create a room     |
| `start-round` | Start a new round         |
| `draw`        | Broadcast drawing strokes |
| `guess`       | Submit a guess            |

### Server → Client

| Event           | Description           |
| --------------- | --------------------- |
| `player-joined` | Update player list    |
| `new-round`     | Announce new drawer   |
| `drawing`       | Sync canvas strokes   |
| `correct-guess` | Notify correct answer |
| `score-update`  | Update scores         |
| `timer`         | Countdown updates     |

---

## 📁 Project Structure

```
pictionary/
├── server/
│   ├── server.js        # Express + Socket.io bootstrap
│   ├── socket.js        # Realtime event handlers
│   ├── gameLogic.js     # Words, turns, scoring
│   └── models/
│       ├── User.js
│       └── Room.js
│
└── client/
    └── src/
        ├── socket.js    # WebSocket connection
        ├── pages/
        │   └── Home.js
        └── components/
            ├── Canvas.js
            └── Chat.js
```

---

## ⚙️ How It Works (High-Level)

1. A user joins a room using a **room code**
2. Server assigns one player as the **drawer**
3. Drawer receives a secret word privately
4. Drawing strokes are broadcast in real time
5. Other players send guesses via chat
6. Correct guesses trigger score updates
7. Turns rotate automatically after each round

---

## ▶️ Running Locally

### Prerequisites

* Node.js
* MongoDB (local or Atlas)

---

### Backend Setup

```bash
cd server
npm install
node server.js
```

Server runs on:

```
http://localhost:5000
```

---

### Frontend Setup

```bash
cd client
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

## ☁️ Deployment

* **Frontend:** Deployed on **Vercel**
* **Backend:** Can be deployed on **Render / Railway / Heroku**
* **WebSockets:** Hosted on the same Node server for reliable real-time communication

---

## 🧠 Key Engineering Decisions

* **Socket.io** chosen over polling for low-latency, bidirectional communication
* **In-memory state** used for active games to avoid database bottlenecks
* **MongoDB** used for persistence due to flexible schema and scalability
* **Separation of concerns** between REST APIs and WebSocket events

---

## 📌 Future Improvements

* Redis integration for scalable real-time state
* Authentication with JWT
* Spectator mode
* Mobile-first UI improvements
* Game history & analytics dashboard


