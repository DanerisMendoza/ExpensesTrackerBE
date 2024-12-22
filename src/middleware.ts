const jwt = require('jsonwebtoken');
const verifyToken = (role) => {
    return (req, res, next) => {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(403).json({ message: 'Token is not provided' });
        }
        jwt.verify(token, 'secret-key-template-for-signing-and-verifying-token', (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            if (role !== null) {
                const hasPermission = decoded.role.includes(role)
                if (!hasPermission) {
                    return res.status(403).json({ message: 'Insufficient permissions' });
                }
            }
            req.user = decoded;
            next();
        });
    };
};

export default verifyToken