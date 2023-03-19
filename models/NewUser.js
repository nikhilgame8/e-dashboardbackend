const mongoose = require("mongoose");

const newUserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    products: [
        {type: mongoose.Schema.Types.ObjectId, ref: "product"}
    ]
})

module.exports = mongoose.model("userRegistration", newUserSchema);