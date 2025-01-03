// config
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
import { Request, Response } from 'express';

// modules route
import userRoute from './modules/user'
import expensesRoute from './modules/expenses'
import analyticsRoute from './modules/analytics'

// swagger config
import swaggerUi from 'swagger-ui-express';
import loadSwaggerFiles from './utils/swagger';
const swaggerDocument = loadSwaggerFiles();
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

app.use(express.json());
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
    credentials: true, // if you are sending cookies or other credentials
  })
);

// Serve Swagger UI
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss:
    '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
  customCssUrl: CSS_URL
}));

// Web View Route
app.get('/', (req: Request, res: Response) => {
  res.send('Dockerized Node JS API based Application with (TS, Swagger and Authentication Feature). Written in Modular Structure for Collaborative Programming');
});

// API Route
const router = express.Router();
router.use(userRoute);
router.use(expensesRoute);
router.use(analyticsRoute);
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});