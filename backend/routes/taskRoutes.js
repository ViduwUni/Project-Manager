const express = require('express');
const Task = require('../models/Task');

module.exports = function (io) {
    const router = express.Router();

    // Get tasks
    router.get('/:boardId', async (req, res) => {
        const tasks = await Task.find({ boardId: req.params.boardId });
        res.json(tasks);
    });

    // Create task
    router.post('/', async (req, res) => {
        try {
            const { boardId, columnId, title, description, priority } = req.body;
            const task = new Task({ boardId, columnId, title, description, priority });
            const saved = await task.save();
            io.to(boardId).emit("new-task", saved); // emit
            res.status(201).json(saved);
        } catch (err) {
            console.error("Task creation error:", err);
            res.status(500).json({ message: "Server error while creating task" });
        }
    });

    // Update task
    router.put('/:id', async (req, res) => {
        try {
            const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

            if (!updatedTask) {
                return res.status(404).json({ message: "Task not found" });
            }

            io.to(updatedTask.boardId.toString()).emit("task-updated", updatedTask);

            res.json(updatedTask);
        } catch (error) {
            console.error("Error updating task:", error);
            res.status(500).json({ message: "Failed to update task" });
        }
    });

    // Delete task
    router.delete('/:id', async (req, res) => {
        const task = await Task.findById(req.params.id);
        if (task) {
            await Task.findByIdAndDelete(req.params.id);
            io.to(task.boardId).emit("task-deleted", task._id); // emit
            res.json({ message: "Task deleted" });
        } else {
            res.status(404).json({ message: "Task not found" });
        }
    });

    return router;
};