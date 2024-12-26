"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (accessRolesRequired) => {
    return (req, res, next) => {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(403).json({ message: 'Token is not provided' });
        }
        jsonwebtoken_1.default.verify(token, 'secretKey', (err, decoded) => {
            if (err) {
                console.error(err);
                return res.status(401).json({ message: err.name });
            }
            console.log('decoded: ', decoded);
            console.log('decode _id: ', decoded.id);
            const requestRole = decoded.role;
            if (requestRole) {
                const hasPermission = requestRole.some((role) => accessRolesRequired.includes(role));
                // return if has no permission
                if (!hasPermission) {
                    return res.status(403).json({ message: 'Insufficient permissions' });
                }
            }
            req.body.user_id = decoded.id;
            next();
        });
    };
};
exports.default = verifyToken;
//# sourceMappingURL=auth.js.map