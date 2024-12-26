"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesSchema = exports.ExpensesModel = void 0;
// schema.ts
require('dotenv').config();
const mongoose = require('mongoose');
const mongoDatabaseURL = process.env.MONGODB_URL;
mongoose.connect(mongoDatabaseURL);
const ExpensesSchema = new mongoose.Schema({
    user_id: String,
    title: String,
    amount: Number,
}, { timestamps: true });
exports.ExpensesSchema = ExpensesSchema;
const ExpensesModel = mongoose.model("expenses", ExpensesSchema);
exports.ExpensesModel = ExpensesModel;
//# sourceMappingURL=model.js.map