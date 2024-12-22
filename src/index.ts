// config
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const path = require("path");
const PORT = process.env.PORT || 3000;

// modules route
import userRoute from './api/user'
import expensesRoute from './api/expenses'

// swagger config
import swaggerUi from 'swagger-ui-express';
import loadSwaggerFiles from './utils/swagger';
const swaggerDocument = loadSwaggerFiles();

app.use(express.json());
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
    credentials: true, // if you are sending cookies or other credentials
  })
);

// Serve Swagger UI
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Web View Route
app.get('/', (req, res) => {
  res.send('Dockerized Node JS API based Application with (TS, Swagger and Authentication Feature). Written in Modular Structure for Collaborative Programming');
});

// API Route
const router = express.Router();
router.use(userRoute);
router.use(expensesRoute);
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});