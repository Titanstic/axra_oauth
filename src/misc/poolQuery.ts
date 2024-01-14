import { assert } from "console";
import pool from "./databaseCon"
import { QueryArrayResult } from "pg";
import logger from "../logger";

const poolQuery = async (queryString: any, values: any) => {
    const con = await pool.connect();
    try {
        assert(queryString);
        assert(typeof queryString === "string");
        if (!values) {
            values = [];
        }
        const result = await con.query(queryString, values);
        return result;
    } catch (e) {
        logger.error("Error connecting to database:", e);
        throw e;
    } finally {
        con.release();
    }
}
export default poolQuery;