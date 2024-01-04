import { RequestHandler } from "express";
import { validationResult } from "express-validator";

export const checkError: RequestHandler = (req): string[] | null => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = errors.array().map(err => err.msg);
        return error;
    }

    return null;
}



