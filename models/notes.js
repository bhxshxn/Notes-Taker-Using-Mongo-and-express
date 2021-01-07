const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    note: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        required: true,
    },
});

module.exports = new mongoose.model("Note", noteSchema);