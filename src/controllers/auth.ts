import { RequestHandler } from "express";
import { createUser, findUserByEmail } from "../models/auth";
import User from "../database/model/users.table";
import * as bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import crypto from "crypto";
import * as jwt from "jsonwebtoken";
import logger from "../logger";

type RequesBodyCreate = {
    username: string,
    email: string,
    password: string
};

type RequestBodyLogin = {
    email: string,
    password: string,
    client_id: string
}


export const clients = [
    {
        clientId: "Axra123",
        clientSecret: "thewaywetouch",
        redirectUri: 'http://localhost:3000/auth/token',
    }
];

const signup: RequestHandler = async (req, res, _next) => {
    const errors = validationResult(req);
    // check error 
    if (!errors.isEmpty()) {
        const error = errors.array().map(err => err.msg);
        logger.error(`${JSON.stringify(error)} : in auth controller(signup)`);
        return res.status(400).json({ message: "Bad Request", errors: error })
    }

    const body = req.body as RequesBodyCreate;

    try {
        // generate hash password
        const salt = await bcrypt.genSalt();
        body.password = await bcrypt.hash(body.password, salt);

        // store database
        const user: User = await createUser(body);

        logger.info(`User account created for ${body.email}`);
        res.status(200).json({ message: "User account created", data: user })
    } catch (err) {
        if (err instanceof Error) {
            logger.error(`Create user error for ${body.email} in auth controller(signup)`);
            res.status(500).json({ message: "unexpected error", errors: err.message });
        }
    }
};


const signinView: RequestHandler = (req, res) => {
    const clientId = req.query.client_id as string;
    const client = clients.find((c) => c.clientId === clientId);

    if (!client) {
        logger.error("Invalid client in auth controller(signinView)")
        return res.status(401).json({ message: "Unauthorized", errors: "Invalid client" });
    }

    logger.info("Return sign in view in auth controller(signinView)");
    res.send(`
        <h1>Login</h1>
        <form method="post" action="/auth/signin">
            <label>Email: </label><input type="text" name="email"><br>
            <label>Password: </label><input type="password" name="password"><br>
            <input type="hidden" name="client_id" value="${clientId}">
            <input type="submit" value="Login">
        </form>
    `)
}

const signin: RequestHandler = async (req, res) => {
    const errors = validationResult(req);
    // check error 
    if (!errors.isEmpty()) {
        const error = errors.array().map(err => err.msg);
        logger.error(`${JSON.stringify(error)} : in auth controller(signin)`);
        return res.status(400).json({ message: "Bad Request", errors: error })
    }

    const { email, password, client_id } = req.body as RequestBodyLogin;

    // find user data by email
    const user: User | null = await findUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
        const authenticationCode = crypto.randomBytes(16).toString("hex");

        // update authentication code in user data
        user.set({ ...user, authenticationCode });
        await user.save();

        logger.info(`redirect link ${clients.find(c => c.clientId === client_id)?.redirectUri}?code=${authenticationCode} : in auth controller(signin)`);
        return res.redirect(`${clients.find(c => c.clientId === client_id)?.redirectUri}?code=${authenticationCode}`);
    }

    logger.error("Invalid User credentials : in auth controller(signin)")
    res.status(401).json({ message: "Unauthorized", errors: "Invalid User credentials" });
}

const generateToken: RequestHandler = (req, res) => {
    const errors = validationResult(req);
    // check error 
    if (!errors.isEmpty()) {
        const error = errors.array().map(err => err.msg);
        logger.error(`${JSON.stringify(error)} : in auth controller(signin)`);
        return res.status(400).json({ message: "Bad Request", errors: error })
    }

    const { email } = req.body as { email: string };

    // generate jwt token
    const payload = { email };
    const secret = "thewaywetouch";
    const options = { expiresIn: "1h" };
    const token = jwt.sign(payload, secret, options);

    logger.info(`Generate token for email:  ${email}`)
    res.status(200).json({ message: "Generate Token", token });
}

export { signup, signinView, signin, generateToken };
