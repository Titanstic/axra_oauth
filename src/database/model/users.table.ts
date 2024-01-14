// import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, NotNull, AllowNull } from "sequelize-typescript";
// import sequelize from "../connection";

// @Table({
//     timestamps: true,
//     tableName: "user",
//     modelName: "User"
// })

// class User extends Model {
//     @Column({
//         primaryKey: true,
//         type: DataType.UUID,
//         defaultValue: DataType.UUIDV4
//     })
//     declare id: string;

//     @Column({
//         type: DataType.STRING,
//     })
//     declare username: string;

//     @Column({
//         type: DataType.STRING,
//     })
//     declare email: string;

//     @Column({
//         type: DataType.STRING,
//     })
//     declare password: string;

//     @Column({
//         type: DataType.STRING,
//     })
//     declare authenticationCode: string;

//     @CreatedAt
//     declare create_at: Date;

//     @UpdatedAt
//     declare updated_at: Date;
// }

// export default User;