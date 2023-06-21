import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactDto } from "./dto/update-contact.dto";
import { Contact, ContactDocument } from "./schemas/contact.schema";

@Injectable()
export class ContactRepository {
    constructor(@InjectModel(Contact.name) private contactModel: Model<ContactDocument>){}

    async findOne(contactFilterQuery: FilterQuery<Contact>): Promise<Contact> {
        return this.contactModel.findOne(contactFilterQuery);
    }

    async find(contactFilterQuery: FilterQuery<Contact>): Promise<Contact[]> {
        return this.contactModel.find(contactFilterQuery).sort({ createdAt: -1 })
    }

    async createContact(contact: Object): Promise<Contact>{
        const newOrders = new this.contactModel(contact);
        return newOrders.save()
    }

    async findOneAndUpdate(contactFilterQuery: FilterQuery<Contact>, contact: Partial<Contact>): Promise<Contact> {
        return this.contactModel.findOneAndUpdate(contactFilterQuery, contact, { new: true, upsert: true });
    }

    async aggregate(aggsQuery: any[]): Promise<any[]> {
        return await this.contactModel.aggregate(aggsQuery);
     }
}