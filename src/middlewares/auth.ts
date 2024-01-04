import { ValidationChain, body, check, param, query } from "express-validator";
import User from "../database/model/users.table";
import { clients } from "../controllers/auth";
import { findUserByAuthen } from "../models/auth";

const validateReuestBodyCreate: ValidationChain[] = [
    body("username").notEmpty().withMessage("Username is required"),
    check("email").
        isEmail().withMessage("Please Enter a valid Email")
        .custom(async (value, { req }) => {
            const user = await User.findOne({ where: { email: value } });
            if (user) {
                return Promise.reject('E-mails already exists. Please pick another one');
            }
        }),
    body("password").isLength({ min: 6, max: 20 }).withMessage("Password muse be between 6 and 20 characters"),
];

const validateReuestBodySignin: ValidationChain[] = [
    body("client_id").notEmpty().withMessage("Client id is required")
        .custom((value, { req }) => {
            const client = clients.find((c) => c.clientId === value);
            if (!client) {
                return false;
            }

            return true;
        }).withMessage("Client id is invalid"),
    check("email").isEmail().withMessage("Email is invalid"),
    body("password").notEmpty().withMessage("Password is required"),
];

const validateAuthenticationCode: ValidationChain[] = [
    query("code").custom(async (value, { req }) => {
        const userData = await findUserByAuthen(value);
        if (!userData) {
            return Promise.reject("Authentication code in invalid");
        }

        req.body = userData.dataValues;
        return true
    })
]

export { validateReuestBodyCreate, validateReuestBodySignin, validateAuthenticationCode };