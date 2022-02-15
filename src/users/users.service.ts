import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { plainToInstance, instanceToInstance } from 'class-transformer';
import { LoggerService } from '../logger/logger.service';
import { UserDocument, User } from './schemas';
import { UserPayload } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: LoggerService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {
    this.logger.setContext(UsersService.name);
  }

  async create(data: UserPayload): Promise<User> {
    this.logger.debug('Creating user...', {
      fn: this.create.name,
      data,
    });

    const doc = new this.userModel(data);
    await doc.save();

    const user = plainToInstance(User, doc.toJSON());

    this.logger.debug('User created', {
      fn: this.create.name,
      user,
    });

    return instanceToInstance(user, { excludePrefixes: ['password'] });
  }

  async findOne(filter: FilterQuery<User>): Promise<User | null> {
    this.logger.debug('Finding user...', {
      fn: this.findOne.name,
      filter,
    });

    const doc = await this.userModel.findOne(filter).exec();

    if (!doc) {
      this.logger.debug('User not found', {
        fn: this.findOne.name,
        filter,
      });

      return null;
    }

    const user = plainToInstance(User, doc.toJSON());

    this.logger.debug('User found', {
      fn: this.findOne.name,
      user,
    });

    return user;
  }
}
