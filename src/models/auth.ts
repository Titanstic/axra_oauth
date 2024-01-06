import { RequestHandler } from "express";
import User from "../database/model/users.table";
import logger from "../logger";

type Body = {
    username: string;
    email: string;
    password: string;
}

const findUserByEmail = async (email: string): Promise<User | null> => {
    logger.info(`Find user by email ${email} in auth model`);
    return await User.findOne({ where: { email } });
};


const findUserByAuthen = async (authenticationCode: string): Promise<User | null> => {
    const user = await User.findOne({ where: { authenticationCode } });

    // one time use for authentication
    if (user) {
        user.set({
            ...user,
            authenticationCode: null
        })
        user.save();
    }

    logger.info(`Find user by auth ${authenticationCode} in auth model`);
    return user;
};

const createUser = async (body: Body): Promise<User> => {
    logger.info(`create user for ${body.email} in auth model`);
    return await User.create(body);
};

export { findUserByEmail, findUserByAuthen, createUser };