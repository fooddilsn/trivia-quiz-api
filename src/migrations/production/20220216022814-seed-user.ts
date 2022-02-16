import { Connection } from 'mongoose';
import { hashPassword } from '../../auth/auth.utils';

module.exports = {
  async up(db: Connection['db']): Promise<void> {
    await db.collection('users').insertOne({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@trivia.com',
      password: hashPassword('YnTR8!rQ'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },

  async down(db: Connection['db']): Promise<void> {
    await db.collection('users').findOneAndDelete({ email: 'john.doe@trivia.com' });
  },
};
