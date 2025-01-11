const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const { faker } = require('@faker-js/faker');
import { Request, Response, NextFunction } from 'express';
import { ExpensesModel } from '@api/modules/expenses/model'
import { checkFileType, storage, upload } from '@api/utils/upload'
import verifyToken from '@api/utils/auth'
import { permissionsTypes } from '@api/modules/user/types';

// User total expense amount
router.get('/analytics/user/:userId/totalAmount', verifyToken([permissionsTypes.admin, permissionsTypes.endUser]), async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const totalAmount = await ExpensesModel.aggregate([
            { $match: { user_id: userId } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);

        res.status(200).json({ totalAmount: totalAmount[0]?.totalAmount || 0 });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// User average expense amount
router.get('/analytics/user/:userId/averageAmount', verifyToken([permissionsTypes.admin, permissionsTypes.endUser]), async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const averageAmount = await ExpensesModel.aggregate([
            { $match: { user_id: userId } },
            { $group: { _id: null, averageAmount: { $avg: "$amount" } } }
        ]);

        res.status(200).json({ averageAmount: averageAmount[0]?.averageAmount || 0 });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// User monthly expenses breakdown
router.get('/analytics/user/:userId/monthlyExpenses', verifyToken([permissionsTypes.admin, permissionsTypes.endUser]), async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const monthlyExpenses = await ExpensesModel.aggregate([
            { $match: { user_id: userId } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$spent_at" } },
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json(monthlyExpenses);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Top N expensive expenses for user
router.get('/analytics/user/:userId/topExpenses', verifyToken([permissionsTypes.admin, permissionsTypes.endUser]), async (req: Request, res: Response) => {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5; // Default to top 5
    try {
        const topExpenses = await ExpensesModel.find({ user_id: userId })
            .sort({ amount: -1 })
            .limit(limit);

        res.status(200).json(topExpenses);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 