const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, ref: "userRegistration", required: true
    },
    invitedUsers: [
        {type: mongoose.Schema.Types.ObjectId, ref: "userRegistration"}
    ],
    createdDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("product", productSchema);