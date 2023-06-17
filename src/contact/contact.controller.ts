import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('identify')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(@Body() createContactDto: CreateContactDto) {  
    if( createContactDto['email'] === null && createContactDto['phoneNumber'] === null){
      return {contact:"Fill anyone of the credentials"}
    }      
    return this.contactService.createOrUpdate(createContactDto);
  }

  @Get()
  user(): string {
    return "Hello User"
  }
}
