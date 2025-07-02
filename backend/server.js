const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const boardRoutesFn = require('./routes/boardRoutes');
const taskRoutesFn = require('./routes/taskRoutes');

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS config
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Socket.IO handlers
io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-board", (boardId) => {
        socket.join(boardId);
        console.log(`Client ${socket.id} joined board ${boardId}`);
    });

    socket.on("new-task", ({ boardId, task }) => {
        socket.to(boardId).emit("new-task", task);
    });

    socket.on("task-updated", ({ boardId, task }) => {
        socket.to(boardId).emit("task-updated", task);
    });

    socket.on("task-deleted", ({ boardId, taskId }) => {
        socket.to(boardId).emit("task-deleted", taskId);
    });

    socket.on("column-updated", ({ boardId, column }) => {
        socket.to(boardId).emit("column-updated", column);
    });

    socket.on("column-deleted", ({ boardId, columnId }) => {
        socket.to(boardId).emit("column-deleted", columnId);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/boards', boardRoutesFn(io));
app.use('/api/tasks', taskRoutesFn(io));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    dbName: 'project_manager'
})
    .then(() => {
        console.log("✅ MongoDB Connected.");
        server.listen(process.env.PORT, '0.0.0.0', () =>
            console.log(`Server running on port ${process.env.PORT}`)
        );
    })
    .catch(err => console.error("MongoDB Connection Error:", err));

module.exports = { io };