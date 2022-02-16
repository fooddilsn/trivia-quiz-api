import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { plainToInstance } from 'class-transformer';
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

    return user;
  }

  async findById(id: string): Promise<User | null> {
    this.logger.debug('Finding user by id...', {
      fn: this.findById.name,
      userId: id,
    });

    const doc = await this.userModel.findById(id).exec();

    if (!doc) {
      this.logger.debug('User not found', {
        fn: this.findById.name,
        userId: id,
      });

      return null;
    }

    const user = plainToInstance(User, doc.toJSON());

    this.logger.debug('User found', {
      fn: this.findById.name,
      user,
    });

    return user;
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

  async update(id: string, data: UserPayload): Promise<User | null> {
    this.logger.debug('Updating user...', {
      fn: this.update.name,
      userId: id,
      data,
    });

    const doc = await this.userModel.findById(id).exec();

    if (!doc) {
      this.logger.debug('User not found', {
        fn: this.update.name,
        userId: id,
      });

      return null;
    }

    Object.assign(doc, data);
    await doc.save();

    const user = plainToInstance(User, doc.toJSON());

    this.logger.debug('User updated', {
      fn: this.update.name,
      user,
    });

    return user;
  }

  async delete(id: string): Promise<User | null> {
    this.logger.debug('Deleting user...', {
      fn: this.delete.name,
      userId: id,
    });

    const doc = await this.userModel.findByIdAndDelete(id).exec();

    if (!doc) {
      this.logger.debug('User not found', {
        fn: this.delete.name,
        userId: id,
      });

      return null;
    }

    const user = plainToInstance(User, doc.toJSON());

    this.logger.debug('User deleted', {
      fn: this.delete.name,
      user,
    });

    return user;
  }
}
