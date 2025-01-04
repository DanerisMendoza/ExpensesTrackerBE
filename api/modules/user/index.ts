const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

import { Request, Response, NextFunction } from 'express';
import { UserModel } from './model'
import { checkFileType, storage, upload } from '@api/utils/upload'
import verifyToken from '@api/utils/auth'
import { permissionsTypes, userType } from './types';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { decodedType } from '@api/utils/types';

router.post('/login', 
    async (req: Request, res: Response) => {
        try {
            const { username, password } = req.body;
            const user = await UserModel.findOne({ username });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            bcrypt.compare(password, user.password)
                .then((isPasswordValid: boolean) => {
                    if (isPasswordValid) {
                        const accessToken = jwt.sign({ id: user._id, name: user.name, email: user.email, username: user.username, role: user.role, profile_pic_path: user.profile_pic_path }, 'danerisAccessSecretKey', { expiresIn: '15m' });
                        const refreshToken = jwt.sign({ id: user._id }, 'danerisAccessSecretKey', { expiresIn: '7d' });
                        res.json({ accessToken, refreshToken, status: 200 });
                    }
                    else {
                        return res.status(401).json({ message: 'Invalid password' });
                    }
                })
                .catch((error: Error) => {
                    console.log(error);
                    return res.status(500).json({ message: 'Internal server error' });
                });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });

router.post('/refreshToken', async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }
        jwt.verify(refreshToken, 'danerisAccessSecretKey', async (err: JsonWebTokenError | null, decoded: unknown) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired refresh token' });
            }
            if (!!decoded) {
                const decodedVal = decoded as decodedType
                const user = await UserModel.findById(decodedVal.id);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                const accessToken = jwt.sign(
                    {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        role: user.role,
                        profile_pic_path: user.profile_pic_path
                    },
                    'danerisAccessSecretKey',
                    { expiresIn: '15m' }
                );
                return res.json({ accessToken, status: 200 });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/createUser', 
    async (req: Request, res: Response) => {
        const { username, name, password, role, email } = req.body;
        bcrypt.hash(password, 10, (err: Error, hashedPassword: string) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Server Error' });
            }

            UserModel.findOne({ $or: [{ username: username }, { email: email }] })
                .then((existingUser: userType) => {
                    if (existingUser) {
                        if (existingUser.username === username) {
                            return res.status(409).json({ message: 'Username already exists!' });
                        } else if (existingUser.email === email) {
                            return res.status(409).json({ message: 'Email already exists!' });
                        }
                    } else {
                        const newUser = new UserModel({
                            name,
                            username,
                            email,
                            password: hashedPassword,
                            role: role && role.length > 0 ? role : [1],
                            profile_pic_path: '',
                        });
                        newUser.save()
                            .then((savedUser: userType) => {
                                return res.status(201).json(savedUser);
                            })
                            .catch((error: Error) => {
                                console.error(error)
                                return res.status(500).json({ message: 'Server Error' });
                            });
                    }
                })
                .catch((error: Error) => {
                    console.error(error)
                    return res.status(500).json({ message: 'Server Error' });
                });
        });
    });

router.get('/getUsers',  verifyToken([permissionsTypes.admin]),
    async (req: Request, res: Response) => {
        UserModel.find({}).then((result: [Object] | []) => {
            return res.json(result)
        }).catch((err:Error) => {
            console.log(err)
        })
    });

router.delete('/deleteAllUsers',  verifyToken([permissionsTypes.admin]),
    async (req:Request, res:Response) => {
        UserModel.deleteMany({})
            .then((deletedUsers:any) => {
                if (deletedUsers.deletedCount === 0) {
                    return res.status(404).json({ message: 'No users found' });
                }
                return res.json({ message: 'All users deleted successfully' });
            })
            .catch((error:Error) => {
                console.error(error);
                return res.status(500).json({ message: 'Server Error' });
            });
    });

router.delete('/deleteNonAdminUsers',  verifyToken([permissionsTypes.admin]),
    async (req:Request, res:Response) => {
        UserModel.deleteMany({ username: { $ne: 'admin' } })
            .then((deletedUsers:any) => {
                if (deletedUsers.deletedCount === 0) {
                    return res.status(404).json({ message: 'No users found to delete except admin' });
                }
                return res.json({ message: 'All users except admin deleted successfully', deletedCount: deletedUsers.deletedCount });
            })
            .catch((error:any) => {
                console.error(error);
                return res.status(500).json({ message: 'Server Error' });
            });
    });



export default router; 