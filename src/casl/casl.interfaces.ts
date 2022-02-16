import { Ability, InferSubjects } from '@casl/ability';
import { Quiz } from '../quizzes/schemas';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = InferSubjects<typeof Quiz> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;
