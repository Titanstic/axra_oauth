import { Sequelize } from "sequelize-typescript";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./dist/database/db.sqlite",
    models: [__dirname + "/model"]

})

export default sequelize;