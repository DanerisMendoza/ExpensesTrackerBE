import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { permissionsTypes } from '@api/modules/user/types';
import { decodedType } from './types';

const verifyToken = (accessRolesRequired: permissionsTypes[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(403).json({ message: 'Token is not provided' });
        }
        jwt.verify(token, 'danerisAccessSecretKey', (err: JsonWebTokenError | null, decoded: unknown) => {
            if (err) {
                console.error(err);
                return res.status(401).json({ message: err.name });
            }
            const requestRole = (decoded as { role: permissionsTypes[] }).role; 
            if (requestRole) {
                const hasPermission = requestRole.some((role) => accessRolesRequired.includes(role));
                // return if has no permission
                if (!hasPermission) {
                    return res.status(403).json({ message: 'Insufficient permissions' });
                }
            }
            // add user_id using the decoded token if there is no user_id in body
            if(!!decoded && !!!req.body.user_id){
                const decodedVal  = decoded as decodedType
                req.body.user_id = decodedVal.id
            }
            next();
        });
    };
};

export default verifyToken;
