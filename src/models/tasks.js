const mongoose = require("mongoose")

const tasksSchema = mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed:{
        type: Boolean,
        default:false
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    }
}, {
    timestamps: true
})

const Task = mongoose.model("tasks", tasksSchema)

module.exports = Task