import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Controller('identify')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  identify(@Body() createContactDto: CreateContactDto) {    
    return this.contactService.createOrUpdate(createContactDto);
  }

  @Get()
  user(): string {
    return "Hello User"
  }
}
