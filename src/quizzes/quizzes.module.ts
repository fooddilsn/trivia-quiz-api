import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaslModule } from '../casl/casl.module';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { Quiz, QuizSchema } from './schemas';

@Module({
  imports: [MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }]), CaslModule],
  controllers: [QuizzesController],
  providers: [QuizzesService],
})
export class QuizzesModule {}
