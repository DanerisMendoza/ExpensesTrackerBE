const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

import { Request, Response, NextFunction } from 'express';
import { ExpensesModel } from './model'
import { checkFileType, storage, upload } from '@api/utils/upload'
import verifyToken from '@api/utils/auth'
import { permissionsTypes } from '@api/modules/user/types';

router.get('/getAllExpenses', upload.none(), verifyToken([permissionsTypes.admin]),
    async (req: Request, res: Response) => {
        try {
            const Expenses = await ExpensesModel.find();
            res.status(200).json(Expenses);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

router.get('/getAllExpenses/me', upload.none(), verifyToken([permissionsTypes.admin, permissionsTypes.endUser]),
    async (req: Request, res: Response) => {
        try {
            const Expenses = await ExpensesModel.find({ user_id: req.body.user_id });
            res.status(200).json(Expenses);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

router.post('/createExpenses', verifyToken([permissionsTypes.endUser, permissionsTypes.admin]),
    async (req: Request, res: Response) => {
        try {
            const { user_id, title, amount } = req.body;
            const newExpenses = new ExpensesModel({ user_id, title, amount });
            const savedExpenses = await newExpenses.save();
            res.status(200).json({ message: 'expenses created successfully!', data: savedExpenses });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

router.delete('/deleteAllExpenses', verifyToken([permissionsTypes.admin]),
    async (req: Request, res: Response) => {
        try {
            await ExpensesModel.deleteMany();
            res.status(200).json({ message: 'All expenses deleted successfully!' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

export default router; 