"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// config
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
// modules route
const user_1 = __importDefault(require("./modules/user"));
const expenses_1 = __importDefault(require("./modules/expenses"));
// swagger config
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./utils/swagger"));
const swaggerDocument = (0, swagger_1.default)();
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    origin: "*",
    credentials: true, // if you are sending cookies or other credentials
}));
// Serve Swagger UI
app.use('/swagger', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument, {
    customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL
}));
// Web View Route
app.get('/', (req, res) => {
    res.send('Dockerized Node JS API based Application with (TS, Swagger and Authentication Feature). Written in Modular Structure for Collaborative Programming');
});
// API Route
const router = express.Router();
router.use(user_1.default);
router.use(expenses_1.default);
app.use('/api', router);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map