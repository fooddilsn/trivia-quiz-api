import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiHideProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Type } from 'class-transformer';
import { normalizeMongoDocument } from '../../common/utils';
import { hashPassword } from '../users.utils';

export type UserDocument = User & Document;

@Schema({
  strictQuery: 'throw',
  timestamps: true,
  toJSON: {
    transform: normalizeMongoDocument,
    virtuals: true,
  },
})
export class User {
  id: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @ApiHideProperty()
  @Prop({ set: (value: string) => hashPassword(value), required: true, select: false })
  password: string;

  @Type(() => Date)
  createdAt: Date;

  @Type(() => Date)
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
