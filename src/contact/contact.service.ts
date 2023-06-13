import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactRepository } from './contact.repository';

@Injectable()
export class ContactService {

  constructor(
    private readonly contactRepository: ContactRepository
  ) { }

  async createOrUpdate(createContactDto: CreateContactDto) {
    // console.log({
    //   ...createContactDto, 
    //   linkPrecedence: "primary",
    //   linkedId: null,
    //   createdAt: new Date,
    //   updatedAt: new Date,
    //   deletedAt: null
    // });

    const aggsQuery = [
      {
        $match: {
          $or: [
            { email: createContactDto['email'] },
            { phoneNumber: createContactDto['phoneNumber'] }
          ]
        }
      },
      {
        $sort: {
          createdAt: 1 // Sort by the "createdAt" field in ascending order
        }
      }
    ]

    const aggsQuery1 = [
      {
        $match: {
          $and: [
            { email: createContactDto['email'] },
            { phoneNumber: createContactDto['phoneNumber'] }
          ]
        }
      },
      {
        $sort: {
          createdAt: 1 // Sort by the "createdAt" field in ascending order
        }
      }
    ]
    const userExist1 = await this.contactRepository.aggregate(aggsQuery1);
    const userExist = await this.contactRepository.aggregate(aggsQuery);
    if (!userExist.length) { 
      console.log("hello");
           
      const contactPayload = {
        ...createContactDto,
        id: this.generateUniqueId(),
        linkPrecedence: "primary",
        linkedId: null,
        createdAt: new Date,
        updatedAt: new Date,
        deletedAt: null
      }
      const createdIdentity = await this.contactRepository.createContact(contactPayload);
      const res = {
        contact:{
          primaryContatctId:createdIdentity['id'],
          emails:[createdIdentity['email']],
          phoneNumbers:[createdIdentity['phoneNumber']],
          secondaryContactIds:[]
        }
      }
      return res
    }
    else if (!userExist1.length){
      console.log("user else",userExist[0]['id'], userExist1.length,!userExist1.length);
      
      // return userExist[0]['id'].valueOf()
      const contactPayload = {
        ...createContactDto,
        id: this.generateUniqueId(),
        linkPrecedence: "secondary",
        linkedId: userExist[0]['id'],
        createdAt: new Date,
        updatedAt: new Date,
        deletedAt: null
      }
      const createdNewIdentity = await this.contactRepository.createContact(contactPayload);
      const res = {
        contact:{
          primaryContatctId:userExist[0]['id'],
          emails: [...new Set([...userExist.map(e => e['email']), createdNewIdentity['email']])],
          phoneNumbers: [...new Set([...userExist.map(e => e['phoneNumber']), createdNewIdentity['phoneNumber']])],
          secondaryContactIds:[...userExist.slice(1).map(e => e['id']), createdNewIdentity['id']]
        }
      }
      return res
    }
    else {
      return "Identity Already Exist"
    }
  }

  generateUniqueId() {
    const timestamp = Date.now().toString();
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return timestamp + randomNum;
  }

  findAll() {
    return `This action returns all contact`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contact`;
  }

  update(id: number, updateContactDto: UpdateContactDto) {
    return `This action updates a #${id} contact`;
  }

  remove(id: number) {
    return `This action removes a #${id} contact`;
  }
}
