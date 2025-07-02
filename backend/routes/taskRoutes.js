const express = require('express');
const Task = require('../models/Task');
const { deleteFile } = require('../utils/deleteFile');

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
        try {
            const task = await Task.findById(req.params.id);
            if (!task) return res.status(404).json({ message: "Task not found" });

            task.descriptions?.forEach(desc => {
                if (desc.content) {
                    // Extract URL inside parentheses
                    const urlMatch = desc.content.match(/\((.*?)\)/);
                    if (urlMatch && urlMatch[1]) {
                        // Extract filename from URL
                        const filename = urlMatch[1].split('/').pop();
                        if (filename) {
                            console.log("🖼️ Deleting file from content:", filename);
                            deleteFile(filename);
                        }
                    }
                }
            });

            await Task.findByIdAndDelete(req.params.id);
            io.to(task.boardId).emit("task-deleted", task._id);

            res.json({ message: "Task deleted" });
        } catch (err) {
            res.status(500).json({ message: "Server error deleting task" });
        }
    });

    return router;
};