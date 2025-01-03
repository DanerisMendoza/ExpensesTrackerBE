const express = require('express');
const router = express.Router();

const { faker } = require('@faker-js/faker');
import { Request, Response, NextFunction } from 'express';
import { ExpensesModel } from './model'
import verifyToken from '@api/utils/auth'
import { permissionsTypes } from '@api/modules/user/types';

router.get('/getAllExpenses', verifyToken([permissionsTypes.admin]),
    async (req: Request, res: Response) => {
        try {
            const Expenses = await ExpensesModel.find();
            res.status(200).json(Expenses);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

router.get('/getAllExpenses/me', verifyToken([permissionsTypes.admin, permissionsTypes.endUser]),
    async (req: Request, res: Response) => {
        try {
            // Get page, limit, search, sortBy, and sortDirection from query params
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || '';
            const sortBy = req.query.sortBy as string || 'createdAt'; // Default to `createdAt`
            const sortDirection = req.query.sortDirection === 'asc' ? 1 : -1; // Default to descending

            // Calculate the number of documents to skip based on the current page
            const skip = (page - 1) * limit;

            // Create a search filter
            const searchFilter = search
                ? {
                    user_id: req.body.user_id,
                    title: { $regex: search, $options: 'i' }, // Case-insensitive search
                }
                : { user_id: req.body.user_id };

            // Fetch expenses with pagination, search filter, and sorting
            const expenses = await ExpensesModel.find(searchFilter)
                .sort({ [sortBy]: sortDirection }) // Dynamic sorting
                .skip(skip)
                .limit(limit);

            // Get total count of expenses for the given user and search criteria
            const totalExpenses = await ExpensesModel.countDocuments(searchFilter);

            // Send paginated response
            res.status(200).json({
                data: expenses,
                page,
                totalPages: Math.ceil(totalExpenses / limit),
                totalExpenses,
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

router.post('/createExpenses', verifyToken([permissionsTypes.endUser, permissionsTypes.admin]),
    async (req: Request, res: Response) => {
        try {
            const { user_id, title, amount, spent_at } = req.body;

            // If spent_at is not provided, set it to the current date
            const spentAt = spent_at || new Date();

            const newExpenses = new ExpensesModel({
                user_id,
                title,
                amount,
                spent_at: spentAt,
            });

            const savedExpenses = await newExpenses.save();
            res.status(200).json({ message: 'Expenses created successfully!', data: savedExpenses });
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

router.delete('/deleteExpenseById/:id', verifyToken([permissionsTypes.admin]),
    async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const expense = await ExpensesModel.findByIdAndDelete(id);

            if (!expense) {
                return res.status(404).json({ message: 'Expense not found' });
            }

            res.status(200).json({ message: 'Expense deleted successfully!' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

router.get('/countExpenses', verifyToken([permissionsTypes.admin]),
    async (req: Request, res: Response) => {
        try {
            const expensesCount = await ExpensesModel.countDocuments();
            res.status(200).json({ count: expensesCount });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

router.post('/seederExpenses/me', verifyToken([permissionsTypes.admin]),
    async (req: Request, res: Response) => {
        try {
            const user_id = req.body.user_id;
            const seed_length = req.body.seed_length;
            const startDate = new Date('2015-01-01');
            const endDate = new Date('2025-01-01');
            console.log(req.body);

            const seeder = Array.from({ length: seed_length || 50000 }, () => {
                const spentAt = faker.date.between({ from: startDate, to: endDate });
                return {
                    user_id: user_id,
                    title: faker.commerce.productName(),
                    amount: parseFloat(faker.commerce.price()),
                    spent_at: spentAt,
                };
            });

            // Use insertMany for bulk creation
            const savedExpenses = await ExpensesModel.insertMany(seeder);
            res.status(200).json({ message: 'Expenses created successfully!', data: savedExpenses });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });

export default router; 