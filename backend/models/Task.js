const mongoose = require('mongoose');

const descriptionSchema = new mongoose.Schema({
    content: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    checked: { type: Boolean, default: false }
});

const taskSchema = new mongoose.Schema({
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board",
        required: true,
    },
    columnId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    title: { type: String, required: true },
    descriptions: [descriptionSchema],
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Task', taskSchema);