"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const model_1 = require("./model");
const upload_1 = require("../../utils/upload");
const auth_1 = __importDefault(require("../../utils/auth"));
const types_1 = require("../../modules/user/types");
router.get('/getAllExpenses', upload_1.upload.none(), (0, auth_1.default)([types_1.permissionsTypes.admin]), async (req, res) => {
    try {
        const Expenses = await model_1.ExpensesModel.find();
        res.status(200).json(Expenses);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/getAllExpenses/me', upload_1.upload.none(), (0, auth_1.default)([types_1.permissionsTypes.admin]), async (req, res) => {
    try {
        const Expenses = await model_1.ExpensesModel.findOne({ user_id: req.body.user_id });
        res.status(200).json(Expenses);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/createExpenses', (0, auth_1.default)([types_1.permissionsTypes.endUser, types_1.permissionsTypes.admin]), async (req, res) => {
    try {
        const { user_id, title, amount } = req.body;
        const newExpenses = new model_1.ExpensesModel({ user_id, title, amount });
        const savedExpenses = await newExpenses.save();
        res.status(200).json({ message: 'expenses created successfully!', data: savedExpenses });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.delete('/deleteAllExpenses', (0, auth_1.default)([types_1.permissionsTypes.admin]), async (req, res) => {
    try {
        await model_1.ExpensesModel.deleteMany();
        res.status(200).json({ message: 'All expenses deleted successfully!' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=index.js.map