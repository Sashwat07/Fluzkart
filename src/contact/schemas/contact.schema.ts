import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsOptional } from 'class-validator';

export type ContactDocument = Contact & Document;

enum precedence {
    Value1 = 'primary',
    Value2 = 'secondary',
  }

@Schema()
export class Contact {

    @Prop()
    id:number

    @Prop()
    @IsOptional()
    phoneNumber: string;

    @Prop()
    @IsOptional()
    email: string;

    @Prop()
    @IsOptional()
    linkedId: Number|null;

    @Prop({type: String, enum: precedence})
    linkPrecedence: precedence;

    @Prop({ default: new Date() })
    createdAt: Date;

    @Prop({ default: new Date() })
    updatedAt: Date;

    @Prop({ default: null})
    @IsOptional()
    deletedAt: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);

ContactSchema.pre<ContactDocument>('findOneAndUpdate', function (next) {
    this.updateOne({}, { updatedAt: new Date() });
    next();
  });