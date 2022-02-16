import { Module } from '@nestjs/common';
import { AbilityFactory } from './factories';

@Module({
  providers: [AbilityFactory],
  exports: [AbilityFactory],
})
export class CaslModule {}
