import jwt from 'jsonwebtoken';

const verifyToken = (accessRoleRequired: number[]) => {
    return (req, res, next) => {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(403).json({ message: 'Token is not provided' });
        }
        jwt.verify(token, 'secretKey', (err, decoded) => {
            if (err) {
                console.log(err)
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const requestRole = decoded.role
            if (requestRole !== null) {
                const hasPermission = requestRole.some((role:number) => accessRoleRequired.includes(role));
                console.log('accessRoleRequired',accessRoleRequired)
                console.log('requestRole',requestRole)
                console.log('hasPermission', hasPermission)
                if (!hasPermission) {
                    return res.status(403).json({ message: 'Insufficient permissions' });
                }
            }

            next();
        });
    };
};

export default verifyToken;
