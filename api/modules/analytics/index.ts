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

router.get('/analytics/totalAndAverage', verifyToken([permissionsTypes.admin]),
    async (req: Request, res: Response) => {
        try {
            const userId = req.body.user_id;
            const result = await ExpensesModel.aggregate([
                { $match: { user_id: userId } },
                { $group: { _id: null, total: { $sum: "$amount" }, average: { $avg: "$amount" } } }
            ]);
            res.status(200).json(result[0]);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

router.get('/analytics/monthlySpending', verifyToken([permissionsTypes.admin]),
    async (req: Request, res: Response) => {
        try {
            const userId = req.body.user_id;
            const result = await ExpensesModel.aggregate([
                { $match: { user_id: userId } },
                { $group: { _id: { $month: "$spent_at" }, total: { $sum: "$amount" } } },
                { $sort: { "_id": 1 } }
            ]);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

router.get('/analytics/topSpenders', verifyToken([permissionsTypes.admin]),
    async (req: Request, res: Response) => {
        try {
            const userId = req.body.user_id;
            const result = await ExpensesModel.aggregate([
                { $match: { user_id: userId } },
                { $group: { _id: "$user_id", total: { $sum: "$amount" } } },
                { $sort: { total: -1 } },
                { $limit: 5 } // Top 5 spenders
            ]);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

router.get('/analytics/spendingFrequency', verifyToken([permissionsTypes.admin]),
    async (req: Request, res: Response) => {
        try {
            const userId = req.body.user_id;
            const result = await ExpensesModel.aggregate([
                { $match: { user_id: userId } },
                { $group: { _id: "$user_id", frequency: { $count: {} } } },
                { $sort: { frequency: -1 } }
            ]);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

router.get('/analytics/expensesCount', verifyToken([permissionsTypes.admin]),
    async (req: Request, res: Response) => {
        try {
            const userId = req.body.user_id;
            const count = await ExpensesModel.countDocuments({ user_id: userId });
            res.status(200).json({ count });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });



export default router; 