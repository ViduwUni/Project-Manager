const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    title: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    columns: [
        {
            name: String,
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                default: () => new mongoose.Types.ObjectId()
            }
        }
    ]
});

module.exports = mongoose.model('Board', boardSchema);