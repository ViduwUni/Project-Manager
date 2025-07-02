const fs = require("fs");
const path = require("path");

const deleteFile = (filename) => {
    const filePath = path.join(__dirname, "../uploads", filename);
    fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", err.message);
        else console.log("Deleted file:", filename);
    });
};

module.exports = { deleteFile };