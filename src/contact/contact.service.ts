import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactRepository } from './contact.repository';

@Injectable()
export class ContactService {

  constructor(
    private readonly contactRepository: ContactRepository
  ) { }

  async createOrUpdate(createContactDto: CreateContactDto) {

    let resultant = [];
    const userExist = await this.usersWithOneCred(createContactDto);
    const userExist1 = await this.usersWithBothCred(createContactDto);

    // no record found with the given credentials
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
      if ([createContactDto['email'], createContactDto['phoneNumber']].includes(null)) {
        return { contact: "Fill the credentials properly. No user exist with given credentials" }
      }
      else {
        const createdIdentity = await this.contactRepository.createContact(contactPayload);
        const res = {
          contact: {
            primaryContatctId: createdIdentity['id'],
            emails: [createdIdentity['email']],
            phoneNumbers: [createdIdentity['phoneNumber']],
            secondaryContactIds: []
          }
        }
        return res
      }

    }
    // if user with both credentials doesn't exist
    else if (!userExist1.length) {
      let result = [];
      let userList = []
      if(userExist[0]['linkPrecedence'] === 'secondary'){
        const user = await this.contactRepository.findOne({ id: userExist[0]['linkedId']})
        userExist.unshift(user)
        userList = await this.contactRepository.find({ linkedId: user['id']})
      }
      else if (userExist[0]['linkPrecedence'] === 'primary'){
        userList = await this.contactRepository.find({linkedId: userExist[0]['id']})
      }
      // remove the duplicate contacts
      resultant = [...userExist, ...userList].filter((obj, index, self) =>
      index === self.findIndex((o) => o.id === obj.id && o.email === obj.email)
    );
      

      const em = resultant.map(e => e['email']);
      const ph = resultant.map(e => e['phoneNumber']);

      if (em.includes(createContactDto['email']) && ph.includes(createContactDto['phoneNumber'])) {
        resultant.slice(1).forEach(async (ele: any) => {

          const up = await this.contactRepository.findOneAndUpdate({ _id: ele['_id'] }, { ...ele, linkPrecedence: "secondary" })
        })
        const res = {
          contact: {
            primaryContatctId: resultant[0]['id'],
            emails: resultant.map(e => e['email']),
            phoneNumbers: resultant.map(e => e['phoneNumber']),
            secondaryContactIds: resultant.slice(1).map(e => e['id'])
          }
        }
        return res
      }
      else {        
        const contactPayload = {
          ...createContactDto,
          id: this.generateUniqueId(),
          linkPrecedence: "secondary",
          linkedId: userExist[0]['id'],
          createdAt: new Date,
          updatedAt: new Date,
          deletedAt: null
        }

        const createdNewIdentity = [createContactDto['email'], createContactDto['phoneNumber']].includes(null) ? { id: null, phoneNumber: null, email: null } : await this.contactRepository.createContact(contactPayload);
        
        const res = {
          contact: {
            primaryContatctId: resultant[0]['id'],
            emails: [...new Set([...resultant.map(e => e['email']), createdNewIdentity['email']])].filter(f => f !== null),
            phoneNumbers: [...new Set([...resultant.map(e => e['phoneNumber']), createdNewIdentity['phoneNumber']])].filter(f => f !== null),
            secondaryContactIds: [...resultant.slice(1).map(e => e['id']), createdNewIdentity['id']].filter(f => f !== null)
          }
        }
        return res
      }
    }
    else {
      return { contact: "Identity Already Exist" }
    }
  }


  async usersWithOneCred(createContact: CreateContactDto) {
    const aggsQuery = [
      {
        $match: {
          $or: [
            { email: createContact['email'] },
            { phoneNumber: createContact['phoneNumber'] }
          ]
        }
      },
      {
        $sort: {
          createdAt: 1
        }
      }
    ]

    return await this.contactRepository.aggregate(aggsQuery)
  }

  async usersWithBothCred(createContact: CreateContactDto) {
    const aggsQuery = [
      {
        $match: {
          $and: [
            { email: createContact['email'] },
            { phoneNumber: createContact['phoneNumber'] }
          ]
        }
      },
      {
        $sort: {
          createdAt: 1
        }
      }
    ]

    return await this.contactRepository.aggregate(aggsQuery);
  }

  generateUniqueId() {
    const timestamp = Date.now().toString();
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return timestamp + randomNum;
  }
}
