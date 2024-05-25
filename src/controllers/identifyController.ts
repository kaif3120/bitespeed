import { Request, Response } from "express";
import Joi from "joi";
import ContactModel from "../models/contact"; // Assuming your model is named ContactModel and located in 'models/contact.ts'
import { Op, Sequelize, where } from "sequelize";
import { Contact } from "../interfaces/contact";

interface ContactRequest {
  email: string;
  phoneNumber: string;
}

// Define Joi schema for request body validation
const contactSchema = Joi.object({
  email: Joi.string().email().optional().allow(null, ""),
  phoneNumber: Joi.string().optional().allow(null, ""),
});

export const identifyContact = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate request body using Joi schema

    const {
      error,
      value,
    }: { error?: Joi.ValidationError; value: ContactRequest } =
      contactSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }

    const { email, phoneNumber }: ContactRequest = value;

    if (!email && !phoneNumber) {
      res.status(404).send({ error: "no records found" });
      return;
    }

    const whereClause: any = {
      [Op.or]: [
        ...(email ? [{ email }] : []),
        ...(phoneNumber ? [{ phoneNumber }] : []),
      ],
    };

    const contacts = await ContactModel.findAll({
      where: whereClause,
      order: [["createdAt", "ASC"]],
    });
    console.log("primary list is", contacts);
    let primaryContacts: Contact[] = [];
    const secondaryContacts: Contact[] = [];

    // if condition will execute if there exists no data with email and phone number
    if (contacts.length == 0) {
      const primaryContact = await ContactModel.create({
        email,
        phoneNumber,
        updatedAt: new Date(),
        createdAt: new Date(),
        linkPrecedence: "primary",
      });
      primaryContacts.push(primaryContact);
    } else {
      // sort all the primary and secondary contacts
      for (const contact of contacts) {
        if (contact.linkPrecedence === "primary") {
          primaryContacts.push(contact);
        } else {
          secondaryContacts.push(contact);
        }
      }

      // if primary contact is not present we find it by the help of linkedId
      if (primaryContacts.length === 0) {
        const primaryContact = await ContactModel.findOne({
          where: {
            id: secondaryContacts[0].linkedId,
          },
        });
        primaryContacts.push(primaryContact!);
      } 
      // if primary contact is more than one then we update the last created one to secondary
      else if (primaryContacts.length > 1) {
        for await (const contact of primaryContacts.slice(
          1,
          primaryContacts.length
        )) {
          secondaryContacts.push(contact);
          await ContactModel.update(
            {
              linkPrecedence: "secondary",
              linkedId: primaryContacts[0]!.id,
              updatedAt: new Date(),
            },
            {
              where: {
                id: contact.id,
              },
            }
          );
        }
      }

      // we check if both email or phonenumber exists or not
      const emailExists = contacts.some((contact) => contact.email === email);
      const phoneNumberExists = contacts.some(
        (contact) => contact.phoneNumber === phoneNumber
      );
      // if either of them doesn't exists we create a secondary contact with it
      if (!(phoneNumberExists && emailExists)) {
        const createdModel: Contact = await ContactModel.create({
          email,
          phoneNumber,
          updatedAt: new Date(),
          createdAt: new Date(),
          linkPrecedence: "secondary",
          linkedId: primaryContacts[0]!.id,
        });
        secondaryContacts.push(createdModel);
      }
    }

    console.log("secondary list is", secondaryContacts);
    const transformedContacts: any = trasnformContacts(
      primaryContacts[0],
      secondaryContacts
    );
    res
      .status(201)
      .json(transformedContacts);
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const trasnformContacts = (
  primaryContact: Contact,
  secondaryContacts: Contact[]
) => {
  const emails: string[] = [primaryContact.email!];
  const phoneNumbers: string[] = [primaryContact.phoneNumber!];
  const secondaryContactIds: number[] = [];
  secondaryContacts.forEach((contact: Contact) => {
    if (contact.email) emails.push(contact.email);
    if (contact.phoneNumber) phoneNumbers.push(contact.phoneNumber);
    secondaryContactIds.push(contact.id);
  });
  return {
    contact: {
      primaryContatctId: primaryContact.id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  };
};
