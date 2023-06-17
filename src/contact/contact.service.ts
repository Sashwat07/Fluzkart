import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactRepository } from './contact.repository';

@Injectable()
export class ContactService {

  constructor(
    private readonly contactRepository: ContactRepository
  ) { }

  async createOrUpdate(createContactDto: CreateContactDto) {

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
          createdAt: 1
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
          createdAt: 1
        }
      }
    ]
    const userExist1 = await this.contactRepository.aggregate(aggsQuery1);
    const userExist = await this.contactRepository.aggregate(aggsQuery);

    if (!userExist.length) {
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
        contact: {
          primaryContatctId: createdIdentity['id'],
          emails: [createdIdentity['email']].filter(f => f !== null),
          phoneNumbers: [createdIdentity['phoneNumber']].filter(f => f !== null),
          secondaryContactIds: []
        }
      }
      return res
    }
    else if (!userExist1.length) {
      const em = userExist.map(e => e['email']);
      const ph = userExist.map(e => e['phoneNumber'])      
      if (em.includes(createContactDto['email']) && ph.includes(createContactDto['phoneNumber'])) {
        userExist.slice(1).forEach(async (ele: any) => {

          const up = await this.contactRepository.findOneAndUpdate({ _id: ele['_id'] }, { ...ele, linkPrecedence: "secondary" })
        })
        const res = {
          contact: {
            primaryContatctId: userExist[0]['id'],
            emails: userExist.map(e => e['email']).filter(f => f !== null),
            phoneNumbers: userExist.map(e => e['phoneNumber']).filter(f => f !== null),
            secondaryContactIds: userExist.slice(1).map(e => e['id'])
          }
        }
        return res
      }
      else {
        // console.log("elsehhhh", userExist.map(e => e['email']));
        
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
          contact: {
            primaryContatctId: userExist[0]['id'],
            emails: [...new Set([...userExist.map(e => e['email']), createdNewIdentity['email']])].filter(f => f !== null),
            phoneNumbers: [...new Set([...userExist.map(e => e['phoneNumber']), createdNewIdentity['phoneNumber']])].filter(f => f !== null),
            secondaryContactIds: [...userExist.slice(1).map(e => e['id']), createdNewIdentity['id']]
          }
        }
        return res
      }
    }
    else {
      return {res:{contact:"Identity Already Exist"}}
    }
  }

  generateUniqueId() {
    const timestamp = Date.now().toString();
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return timestamp + randomNum;
  }
}
