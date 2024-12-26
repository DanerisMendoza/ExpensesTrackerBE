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
const types_1 = require("./types");
router.post('/login', upload_1.upload.none(), async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await model_1.UserModel.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        bcrypt.compare(password, user.password)
            .then((isPasswordValid) => {
            if (isPasswordValid) {
                const accessToken = jwt.sign({ id: user._id, name: user.name, email: user.email, username: user.username, role: user.role, profile_pic_path: user.profile_pic_path }, 'secretKey', { expiresIn: '15m' });
                const refreshToken = jwt.sign({ id: user._id }, 'danerisAccessSecretKey', { expiresIn: '7d' });
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/refreshToken', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }
        // Verify the refresh token
        jwt.verify(refreshToken, 'danerisAccessSecretKey', async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired refresh token' });
            }
            // Find the user associated with the refresh token
            const user = await model_1.UserModel.findById(decoded.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Generate a new access token
            const accessToken = jwt.sign({
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                profile_pic_path: user.profile_pic_path
            }, 'secretKey', { expiresIn: '15m' });
            return res.json({ accessToken, status: 200 });
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/createUser', upload_1.upload.none(), async (req, res) => {
    const { username, name, password, role, email } = req.body;
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server Error' });
        }
        model_1.UserModel.findOne({ $or: [{ username: username }, { email: email }] })
            .then(existingUser => {
            if (existingUser) {
                console.log(existingUser);
                if (existingUser.username === username) {
                    return res.status(409).json({ message: 'Username already exists!' });
                }
                else if (existingUser.email === email) {
                    return res.status(409).json({ message: 'Email already exists!' });
                }
            }
            else {
                const newUser = new model_1.UserModel({
                    name,
                    username,
                    email,
                    password: hashedPassword,
                    role: role && role.length > 0 ? role : [1],
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
router.get('/getUsers', upload_1.upload.none(), (0, auth_1.default)([types_1.permissionsTypes.admin]), async (req, res) => {
    model_1.UserModel.find({}).then((result) => {
        return res.json(result);
    }).catch((err) => {
        console.log(err);
    });
});
router.delete('/deleteAllUsers', upload_1.upload.none(), (0, auth_1.default)([types_1.permissionsTypes.admin]), async (req, res) => {
    model_1.UserModel.deleteMany({})
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
router.delete('/deleteNonAdminUsers', upload_1.upload.none(), (0, auth_1.default)([types_1.permissionsTypes.admin]), async (req, res) => {
    model_1.UserModel.deleteMany({ username: { $ne: 'admin' } })
        .then(deletedUsers => {
        if (deletedUsers.deletedCount === 0) {
            return res.status(404).json({ message: 'No users found to delete except admin' });
        }
        return res.json({ message: 'All users except admin deleted successfully', deletedCount: deletedUsers.deletedCount });
    })
        .catch(error => {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map