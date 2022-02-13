import { applyDecorators } from '@nestjs/common';
import { registerDecorator, ValidationOptions, buildMessage } from 'class-validator';

export const UniqueCorrectAnswer = (validationOptions?: ValidationOptions) =>
  applyDecorators((object: Record<string, unknown>, propertyName: string) => {
    registerDecorator({
      name: 'UniqueCorrectAnswer',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) =>
          Array.isArray(value) && value.filter((answer) => answer.correct).length === 1,
        defaultMessage: buildMessage(
          (eachPrefix) => `${eachPrefix}$property must contain one correct answer`,
          validationOptions
        ),
      },
    });
  });
