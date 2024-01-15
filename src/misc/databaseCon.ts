import { Pool } from "pg";
import logger from "../logger";
import { databaseHost, databaseUsername, databaseName, databasePassword } from "../config";

const pool: Pool = new Pool({
    host: databaseHost,
    user: databaseUsername,
    database: databaseName,
    password: databasePassword,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.connect((err, _client, release) => {
    if (err) {
        logger.error('Error acquiring client', err.stack);
        process.exit(-1);
    }
    logger.info("Database is connected to postgres");
    release();
})

pool.on('error', (err, _client) => {
    logger.error("Unexpected error on idle client", err);
    process.exit(-1)
});


export default pool;
