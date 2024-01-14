import logger from "../logger";
import poolQuery from "../misc/poolQuery";


type Body = {
    username: string;
    email: string;
    password: string;
    phone: string;
}
export interface findUserByEmailType {
    password: string
}


const createUser = async ({ username, email, phone, password }: Body) => {
    logger.info(`create user for ${email} in auth model`);
    return await poolQuery("INSERT INTO users(name, email, phone, password) VALUES($1, $2, $3, $4) returning id", [username, email, phone, password])
};

const findUserByEmail = async (email: string): Promise<findUserByEmailType | null> => {
    try {
        logger.info(`Find user by email ${email} in auth model`);
        const result = await poolQuery("SELECT password FROM users WHERE email = $1", [email]);

        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        logger.error(`Error finding user by email ${email}: ${error}`);
        throw error;
    }
};


const insertAuthCode = async (otp: string, email: string) => {
    try {
        logger.info(`Insert Authentication code by email ${email} in auth model`);
        return await poolQuery("UPDATE users SET otp = $1 WHERE email = $2", [otp, email]);
    } catch (error) {
        logger.error(`Error insert auth code by email ${email}: ${error}`);
        throw error;
    }
}


const findUserByAuthen = async (authenticationCode: string) => {
    const user = await poolQuery("SELECT id,email FROM users WHERE otp = $1", [authenticationCode]);
    // one time use for authentication
    if (user.rows.length > 0) {
        await poolQuery("UPDATE users SET otp = NULL WHERE otp = $1", [authenticationCode]);
    }

    logger.info(`Find user by auth ${authenticationCode} in auth model`);
    return user;
};


export { findUserByEmail, insertAuthCode, findUserByAuthen, createUser };