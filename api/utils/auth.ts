import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { permissionsTypes } from '../modules/user/types';

const verifyToken = (accessRolesRequired: permissionsTypes[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(403).json({ message: 'Token is not provided' });
        }

        jwt.verify(token, 'secretKey', (err, decoded) => {
            if (err) {
                console.error(err);
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const requestRole = (decoded as { role: permissionsTypes[] }).role; 
            if (requestRole) {
                const hasPermission = requestRole.some((role) => accessRolesRequired.includes(role));
                // log checking purpose 
                console.log('accessRolesRequired', accessRolesRequired);
                console.log('requestRole', requestRole);
                console.log('hasPermission', hasPermission);
                // return if has no permission
                if (!hasPermission) {
                    return res.status(403).json({ message: 'Insufficient permissions' });
                }
            }

            next();
        });
    };
};

export default verifyToken;
