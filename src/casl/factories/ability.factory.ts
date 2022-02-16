import { Injectable } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType } from '@casl/ability';
import { AuthUser } from '../../auth/auth.interfaces';
import { Quiz } from '../../quizzes/schemas';
import { Action, Subjects, AppAbility } from '../casl.interfaces';

@Injectable()
export class AbilityFactory {
  create(user: AuthUser): AppAbility {
    const { can, build } = new AbilityBuilder<Ability<[Action, Subjects]>>(
      Ability as AbilityClass<AppAbility>
    );

    can(Action.Manage, Quiz, { userId: user.id });

    return build({
      detectSubjectType: (object) => {
        return object.constructor as ExtractSubjectType<Subjects>;
      },
    });
  }
}
