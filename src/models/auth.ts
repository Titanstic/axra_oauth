import { RequestHandler } from "express";
import User from "../database/model/users.table";

type Body = {
    username: string;
    email: string;
    password: string;
}

const findUserByEmail = async (email: string): Promise<User | null> => {
    return await User.findOne({ where: { email } });
};


const findUserByAuthen = async (authenticationCode: string): Promise<User | null> => {
    const user = await User.findOne({ where: { authenticationCode } });

    // for one time use
    if (user) {
        user.set({
            ...user,
            authenticationCode: null
        })
        user.save();
    }

    return user;
};

const createUser = async (body: Body): Promise<User> => {
    return await User.create(body);
};

export { findUserByEmail, findUserByAuthen, createUser };