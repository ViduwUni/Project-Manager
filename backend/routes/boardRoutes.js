const express = require('express');
const Board = require('../models/Board');
const Task = require('../models/Task');

module.exports = function (io) {
    const router = express.Router();

    // Get all boards with progress calculation
    router.get('/', async (req, res) => {
        try {
            const boards = await Board.find();
            const results = [];

            for (const board of boards) {
                // Find all tasks for this board
                const tasks = await Task.find({ boardId: board._id });

                // Find the ID of the "Done" column
                const doneColumn = board.columns.find(
                    (col) => col.name.toLowerCase() === "done"
                );

                const doneColumnId = doneColumn ? doneColumn._id.toString() : null;

                // Count tasks in done column
                const totalTasks = tasks.length;
                const doneTasks = doneColumnId
                    ? tasks.filter((t) => t.columnId.toString() === doneColumnId).length
                    : 0;

                const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

                results.push({
                    ...board.toObject(),
                    progress,
                });
            }

            res.json(results);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error fetching boards" });
        }
    });

    // Get a single board by ID
    router.get('/:id', async (req, res) => {
        try {
            const board = await Board.findById(req.params.id);
            if (!board) return res.status(404).json({ message: "Board not found" });
            res.json(board);
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    });

    // Create board
    router.post('/', async (req, res) => {
        const newBoard = new Board({
            title: req.body.title,
            columns: [
                { name: "To Do" },
                { name: "In Progress" },
                { name: "Done" }
            ]
        });
        const savedBoard = await newBoard.save();
        res.status(201).json(savedBoard);
    });

    // Rename board
    router.put('/:id', async (req, res) => {
        const board = await Board.findById(req.params.id);
        if (!board) return res.status(404).json({ message: "Board not found" });

        board.title = req.body.title || board.title;
        await board.save();

        res.json(board);
    });

    // Delete board
    router.delete('/:id', async (req, res) => {
        await Board.findByIdAndDelete(req.params.id);
        res.json({ message: "Board deleted" });
    });

    // Add column
    router.post("/:id/columns", async (req, res) => {
        const board = await Board.findById(req.params.id);
        const column = { name: req.body.name };
        board.columns.push(column);
        await board.save();
        io.to(req.params.id).emit("column-updated", column); // emit here
        res.status(201).json(board);
    });

    // Rename column
    router.put("/:boardId/columns/:columnId", async (req, res) => {
        const board = await Board.findById(req.params.boardId);
        const column = board.columns.id(req.params.columnId);
        if (column) {
            column.name = req.body.name;
            await board.save();
            io.to(req.params.boardId).emit("column-updated", column); // emit here
            res.json(board);
        } else {
            res.status(404).json({ error: "Column not found" });
        }
    });

    // Delete column
    router.delete("/:boardId/columns/:columnId", async (req, res) => {
        const board = await Board.findById(req.params.boardId);
        board.columns = board.columns.filter(col => col._id.toString() !== req.params.columnId);
        await board.save();

        await Task.deleteMany({ columnId: req.params.columnId });

        io.to(req.params.boardId).emit("column-deleted", req.params.columnId); // emit
        res.json(board);
    });

    return router;
}