import { RequestHandler } from "express";
import { createUser, findUserByEmail, findUserByEmailType, insertAuthCode } from "../models/auth";
import * as bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import crypto from "crypto";
import * as jwt from "jsonwebtoken";
import logger from "../logger";

type RequesBodyCreate = {
    username: string,
    email: string,
    password: string
    phone: string
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
        console.log(error);
        logger.error(`${JSON.stringify(error)} : in auth controller(signup)`);
        return res.status(400).json({ message: "Bad Request", errors: error })
    }

    const body = req.body as RequesBodyCreate;

    try {
        // generate hash password
        const salt = await bcrypt.genSalt();
        body.password = await bcrypt.hash(body.password, salt);

        // store database
        const user = await createUser(body);

        logger.info(`User account created for ${body.email}`);
        res.status(200).json({ message: "User account created", data: user.rows[0] })
    } catch (err) {
        if (err instanceof Error) {
            logger.error(`Create user error for ${err.message} in auth controller(signup)`);
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

    try {
        // find user data by email
        const user: any = await findUserByEmail(email);

        if (user && (await bcrypt.compare(password, user.password))) {
            // generate authentication code for one time use, to get jwt token
            const authenticationCode = crypto.randomBytes(16).toString("hex");

            await insertAuthCode(authenticationCode, email);

            logger.info(`redirect link ${clients.find(c => c.clientId === client_id)?.redirectUri}?code=${authenticationCode} : in auth controller(signin)`);
            return res.status(200).json({ message: "Generate token for Authenticationcode", code: authenticationCode });
        }

        logger.error("Invalid User credentials : in auth controller(signin)")
        res.status(401).json({ message: "Unauthorized", errors: "Invalid User credentials" });
    } catch (err) {
        if (err instanceof Error) {
            logger.error(`Sign in for ${err.message} in auth controller(signin)`);
            res.status(500).json({ message: "unexpected error", errors: err.message });
        }
    }
}

const generateToken: RequestHandler = (req, res) => {
    const errors = validationResult(req);
    // check error 
    if (!errors.isEmpty()) {
        const error = errors.array().map(err => err.msg);

        logger.error(`${JSON.stringify(error)} : in auth controller(signin)`);
        return res.status(400).json({ message: "Bad Request", errors: error })
    }

    const { email, id } = req.body as { email: string, id: number };

    // generate access token
    const payload = { email, id };
    const secret: any = process.env.ACCESS_TOKEN_SECRET;
    const options = { expiresIn: "1h" };
    const token = jwt.sign(payload, secret, options);

    // generate refresh token
    const resfreshSecret: any = process.env.REFRESH_TOKEN_SECRET;
    const refreshToken = jwt.sign({ email }, resfreshSecret, { expiresIn: "7d" });

    logger.info(`Generate token for email:  ${email}`);
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.status(200).json({ message: "Access Token", token });
};

const refreshGenerateToken: RequestHandler = (req, res) => {
    if (req.cookies?.jwt) {
        const refreshToken = req.cookies.jwt;

        // verify refresh token
        const refreshAccess: any = process.env.REFRESH_TOKEN_SECRET;
        jwt.verify(refreshToken, refreshAccess,
            (err: any, decode: any) => {
                if (err) {
                    res.status(406).json({ message: "Unauthorized", error: err.message });
                } else {
                    const payload = { email: decode.email };
                    const secret: any = process.env.ACCESS_TOKEN_SECRET;
                    const options = { expiresIn: "1h" };
                    const token = jwt.sign(payload, secret, options);

                    res.status(200).json({ message: "Access Token", token });
                }
            }
        )
    } else {
        res.status(406).json({ message: "Unauthorized" });
    }
}

export { signup, signinView, signin, generateToken, refreshGenerateToken };
