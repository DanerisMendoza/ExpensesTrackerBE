const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

import { UserModel } from './model'
import { checkFileType, storage, upload } from '../../utils/upload'
import verifyToken from '../../utils/auth'

router.post('/login', upload.none(),
    async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await UserModel.findOne({ username });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            bcrypt.compare(password, user.password)
                .then((isPasswordValid) => {
                    if (isPasswordValid) {
                        const accessToken = jwt.sign({ id: user._id, name: user.name, email: user.email, username: user.username, role: user.role, profile_pic_path: user.profile_pic_path }, 'secretKey', { expiresIn: '30m' });
                        const refreshToken = jwt.sign({ id: user._id, name: user.name, email: user.email, username: user.username, role: user.role, profile_pic_path: user.profile_pic_path }, 'secretKey', { expiresIn: '7d' });
                        res.json({ accessToken, refreshToken, status: 200 });
                    }
                    else {
                        return res.status(401).json({ message: 'Invalid password' });
                    }
                })
                .catch((error) => {
                    console.log(error);
                    return res.status(500).json({ message: 'Internal server error' });
                });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });


router.post('/createUser', upload.none(),
    async (req, res) => {
        const { username, name, password, role, email } = req.body;
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Server Error' });
            }

            UserModel.findOne({ $or: [{ username: username }, { email: email }] })
                .then(existingUser => {
                    if (existingUser) {
                        console.log(existingUser)
                        if (existingUser.username === username) {
                            return res.status(400).json({ message: 'Username already exists!' });
                        } else if (existingUser.email === email) {
                            return res.status(400).json({ message: 'Email already exists!' });
                        }
                    } else {
                        const newUser = new UserModel({
                            name,
                            username,
                            email,
                            password: hashedPassword,
                            role,
                            profile_pic_path: '',
                        });
                        newUser.save()
                            .then(savedUser => {
                                return res.status(201).json(savedUser);
                            })
                            .catch(error => {
                                console.error(error);
                                return res.status(500).json({ message: 'Server Error' });
                            });
                    }
                })
                .catch(error => {
                    console.error(error);
                    return res.status(500).json({ message: 'Server Error' });
                });
        });
    });

router.get('/getUsers', upload.none(), verifyToken([0]), 
    async (req, res) => {
        UserModel.find({}).then((result) => {
            return res.json(result)
        }).catch((err) => {
            console.log(err)
        })
    });

router.delete('/deleteAllUsers', upload.none(),
    async (req, res) => {
        UserModel.deleteMany({})
        .then(deletedUsers => {
          if (deletedUsers.deletedCount === 0) {
            return res.status(404).json({ message: 'No users found' });
          }
          return res.json({ message: 'All users deleted successfully' });
        })
        .catch(error => {
          console.error(error);
          return res.status(500).json({ message: 'Server Error' });
        });
    });

export default router; 