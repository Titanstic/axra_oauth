import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
// router
import AuthRouter from "./routes/auth";
import logger from "./logger";
import cookieParser from "cookie-parser";

const app = express();

// db connection to sql lite
// sequelize.sync({ force: false })
//     .then(() => console.log("db is connected"))
//     .catch((err) => console.log("Unable to connect to database: " + err.message));

// middleware
dotenv.config();
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json());
app.use(cookieParser());


// =>  /auth
app.use('/auth', AuthRouter);

// => not found
app.use((_req, res) => {
    res.status(404).json({ message: 'Not Found URL' });
})

// build server
const port = process.env.PORT || 3001;
app.listen(port, () => {
    logger.info(`Server is running at ${port}`);
})