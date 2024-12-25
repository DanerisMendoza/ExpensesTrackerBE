import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { permissionsTypes } from '../modules/user/types';
import { decodedType } from './types';

const verifyToken = (accessRolesRequired: permissionsTypes[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(403).json({ message: 'Token is not provided' });
        }

        jwt.verify(token, 'secretKey', (err: JsonWebTokenError | TokenExpiredError, decoded:decodedType) => {
            if (err) {
                console.error(err);
                return res.status(401).json({ message: err.name });
            }
            console.log('decoded: ', decoded)
            console.log('decode _id: ',decoded.id)
            const requestRole = (decoded as { role: permissionsTypes[] }).role; 
            if (requestRole) {
                const hasPermission = requestRole.some((role) => accessRolesRequired.includes(role));
                // return if has no permission
                if (!hasPermission) {
                    return res.status(403).json({ message: 'Insufficient permissions' });
                }
            }
            req.user_id = decoded.id
            next();
        });
    };
};

export default verifyToken;
