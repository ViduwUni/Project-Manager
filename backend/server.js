const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

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

// Multer storage
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

const voiceNotesDir = path.join(__dirname, "uploads/voice-notes");
if (!fs.existsSync(voiceNotesDir)) {
    fs.mkdirSync(voiceNotesDir, { recursive: true });
};

const voiceStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, voiceNotesDir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const voiceUpload = multer({
    storage: voiceStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'audio/webm') {
            cb(null, true);
        } else {
            cb(new Error("Only .webm audio allowed"), false);
        }
    }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");
    res.json({
        url: `${req.protocol}://${req.get('host')}/api/uploads/${req.file.filename}`,
        filename: req.file.filename
    });
});
app.post('/api/upload/voice', voiceUpload.single('voice'), (req, res) => {
    if (!req.file) return res.status(400).send("No file uploaded");
    res.json({
        url: `${req.protocol}://${req.get('host')}/api/uploads/voice-notes/${req.file.filename}`,
        filename: req.file.filename
    });
});
app.delete('/api/uploads/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(voiceNotesDir, filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Failed to delete file:", err.message);
            return res.status(404).json({ error: 'File not found' });
        }
        res.json({ success: true, message: 'File deleted' });
    });
});

// Routes
app.use('/api/boards', boardRoutesFn(io));
app.use('/api/tasks', taskRoutesFn(io));
app.use('/api/uploads', express.static('uploads'));

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