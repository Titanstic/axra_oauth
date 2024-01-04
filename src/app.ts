import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./database/connection";
// router
import AuthRouter from "./routes/auth";

const app = express();

// db connection
sequelize.sync({ force: false })
    .then(() => console.log("db is connected"))
    .catch((err) => console.log("Unable to connect to database: " + err.message));

// middleware
dotenv.config();
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json());

// =>  /auth
app.use('/auth', AuthRouter);

// => not found
app.use((_req, res) => {
    res.status(404).json({ message: 'Not Found URL' });
})

// build server
const port = process.env.PORT || 30001;
app.listen(port, () => {
    console.log(`[SERVER] : Server is running at ${port}`)
})