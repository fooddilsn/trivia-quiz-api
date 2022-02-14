import { Chance } from 'chance';
import { QuizPayload, QuestionPayload, AnswerPayload } from '../dto';
import { Quiz, Question, Answer } from '../schemas';

const chance = new Chance();

const quiz = {
  name: (): string => chance.sentence({ words: 3 }),
  question: (): string => `${chance.sentence({ words: 7 }).slice(0, -1)}?`,
  answer: (): string => chance.sentence({ words: 5 }),
};

export const mockQuiz = (): Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: quiz.name(),
  questions: [mockQuestion(), mockQuestion(), mockQuestion()],
});

export const mockQuestion = (): Question => ({
  text: quiz.question(),
  answers: [mockAnswer(true), mockAnswer(), mockAnswer(), mockAnswer()],
});

export const mockAnswer = (correct: boolean = false): Answer => ({
  text: quiz.answer(),
  correct,
});

export const mockQuizPayload = (questions?: any[]): QuizPayload => ({
  name: quiz.name(),
  questions: questions || [mockQuestionPayload(), mockQuestionPayload(), mockQuestionPayload()],
});

export const mockQuestionPayload = (answers?: any[]): QuestionPayload => ({
  text: quiz.question(),
  answers: answers || [
    mockAnswerPayload(true),
    mockAnswerPayload(),
    mockAnswerPayload(),
    mockAnswerPayload(),
  ],
});

export const mockAnswerPayload = (correct: boolean = false): AnswerPayload => ({
  text: quiz.answer(),
  correct,
});
