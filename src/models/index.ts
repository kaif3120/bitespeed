import { Sequelize } from "sequelize";
import dotenv from 'dotenv'
dotenv.config()

const db: any = {};

console.log("envirnmenys ",  process.env.DB_SCHEMA!,
process.env.DB_USERNAME!,
process.env.DB_PASSWORD!,)

const sequelize = new Sequelize(
  process.env.DB_SCHEMA!,
  process.env.DB_USERNAME!,
  process.env.DB_PASSWORD!,
  {
    dialect: "postgres",
    host: process.env.DB_HOSTNAME,
    port: parseInt(process.env.DB_PORT!),
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
      connectTimeout: 10000,
    },
    pool: {
      max: 5,
      min: 1,
      acquire: 10000,
      idle: 8000,
    },
    // logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

export { sequelize, Sequelize, db as models };
