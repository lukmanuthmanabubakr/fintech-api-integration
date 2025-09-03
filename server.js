const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./src/config/db");
const cookieParser = require("cookie-parser");


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());


// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/wallets", require("./src/routes/walletRoutes"));
app.use("/api/transactions", require("./src/routes/transactionRoutes"));

app.get("/", (req, res) => {
  res.send("Home Page");
});

// Error handling middleware
const { errorHandler } = require("./src/middlewares/errorHandler");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
