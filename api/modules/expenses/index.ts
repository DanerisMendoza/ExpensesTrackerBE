const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

import { ExpensesModel } from './model'
import { checkFileType, storage, upload } from '../../utils/upload'
import verifyToken from '../../utils/auth'
import { permissionsTypes } from '../user/types';

router.get('/getAllExpenses', upload.none(), verifyToken([permissionsTypes.admin]),
    async (req, res) => {
        try {
            const Expenses = await ExpensesModel.find();
            res.status(200).json(Expenses);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

router.post('/createExpenses', verifyToken([permissionsTypes.endUser, permissionsTypes.admin]),
    async (req, res) => {
        try {
            const { user_id, title, amount } = req.body;
            const newExpenses = new ExpensesModel({ user_id, title, amount });
            const savedExpenses = await newExpenses.save();
            res.status(200).json({ message: 'expenses created successfully!', data: savedExpenses });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

router.delete('/deleteAllExpenses', verifyToken([permissionsTypes.admin]),
    async (req, res) => {
        try {
            await ExpensesModel.deleteMany();
            res.status(200).json({ message: 'All expenses deleted successfully!' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

export default router; 