"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const yamljs_1 = __importDefault(require("yamljs"));
const loadSwaggerFiles = () => {
    const modulesDir = path_1.default.join(__dirname, '../modules');
    const modules = fs_1.default.readdirSync(modulesDir);
    const swaggerDocs = modules
        .map((module) => {
        const swaggerPath = path_1.default.join(modulesDir, module, 'swagger.yaml');
        if (fs_1.default.existsSync(swaggerPath)) {
            return yamljs_1.default.load(swaggerPath);
        }
        return null;
    })
        .filter((doc) => doc !== null);
    const mergedPaths = swaggerDocs.reduce((acc, doc) => ({ ...acc, ...doc.paths }), {});
    return {
        openapi: '3.0.0',
        info: {
            title: 'My API',
            version: '1.0.0',
        },
        servers: [
            {
                url: 'http://localhost:9000/api',
                description: 'docker server',
            },
            {
                url: 'http://localhost:3000/api',
                description: 'local server',
            },
            {
                url: 'https://node-express-ts-template.vercel.app/api',
                description: 'vercel server',
            },
        ],
        paths: mergedPaths,
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT', // Optional, adds clarity for the token format
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    };
};
exports.default = loadSwaggerFiles;
//# sourceMappingURL=swagger.js.map