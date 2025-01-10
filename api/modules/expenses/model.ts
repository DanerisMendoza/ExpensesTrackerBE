// schema.ts
require('dotenv').config();
const mongoose = require('mongoose')
const mongoDatabaseURL = process.env.MONGODB_URL;
mongoose.connect(mongoDatabaseURL)

const ExpensesSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true, 
    },
    title: {
        type: String,
        required: true, 
        trim: true, 
    },
    spent_at: {
        type: Date,
        default: Date.now, 
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'Amount cannot be negative'], 
    },
}, { timestamps: true });

const ExpensesModel = mongoose.model("expenses", ExpensesSchema)

export { ExpensesModel, ExpensesSchema };