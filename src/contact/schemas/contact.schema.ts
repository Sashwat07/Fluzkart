import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongodb';
import { IsOptional, IsString } from 'class-validator';

export type ContactDocument = Contact & Document;

enum precedence {
    Value1 = 'primary',
    Value2 = 'secondary',
  }

@Schema()
export class Contact {

    @Prop()
    id: Number;

    @Prop()
    @IsOptional()
    phoneNumber: string;

    @Prop()
    @IsOptional()
    email: string;

    @Prop()
    @IsOptional()
    linkedId: Number;

    @Prop({type: String, enum: precedence})
    linkPrecedence: precedence;

    @Prop({ default: new Date() })
    createdAt: Date;

    @Prop({ default: new Date() })
    updatedAt: Date;

    @Prop()
    deletedAt: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);


ContactSchema.pre<ContactDocument>('findOneAndUpdate', function (next) {
    this.update({}, { updatedAt: new Date() });
    next();
  });