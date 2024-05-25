// /models/book.ts
import { Model, Optional, DataTypes } from "sequelize";
import {sequelize} from ".";
import { Contact as ContactInterface } from "../interfaces/contact";

interface Contact {
  id: string;
  title: string;
  numberOfPages: number;
  authorId: string;
}

interface ContactCreation extends Optional<Contact, "id"> {}

interface ContactInstance
  extends Model<ContactInterface, ContactCreation>,
    Contact {}

const Contact = sequelize.define<ContactInstance>("Contact", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  linkedId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  linkPrecedence: {
    type: DataTypes.ENUM("secondary", "primary"),
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
    timestamps:true
});

export default Contact;
