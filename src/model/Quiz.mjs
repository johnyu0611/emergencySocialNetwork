import { QuizSchema } from "@/database/schema/Quiz.mjs";
import { AbstractModel } from "@/model/Abstract.mjs";

export class QuizDataAccess extends AbstractModel {
  static #initializationSymbol = "%";
  static #instance = null;

  constructor(collectionName, schema, symbol) {
    if (symbol !== QuizDataAccess.#initializationSymbol) {
      throw new Error(
        "Cannot initialize a singleton QuizDataAccess class via constructor"
      );
    }
    super({ collectionName, schema });
    QuizDataAccess.#instance = this;
    return QuizDataAccess.#instance;
  }

  static getInstance() {
    if (!QuizDataAccess.#instance) {
      new QuizDataAccess(
        "quizzes",
        QuizSchema,
        QuizDataAccess.#initializationSymbol
      );
    }
    return QuizDataAccess.#instance;
  }

  async create(quiz) {
    return await new this.model(quiz).save();
  }

  async fetchRandom() {
    try {
      const count = await this.model.countDocuments();
      if (count === 0) {
        return null; // No quizzes available
      }
      const randomIndex = Math.floor(Math.random() * count);
      const quiz = await this.model.findOne().skip(randomIndex).exec();
      return quiz;
    } catch (error) {
      throw new Error(`Failed to fetch a random quiz: ${error.message}`);
    }
  }

  async getRandomQuestionID() {
    const questionIDs = await this.model.find({}, { questionID: 1, _id: 0 }); // Fetch all questionIDs
    if (questionIDs.length === 0) {
      throw new Error("No questions available.");
    }

    const randomIndex = Math.floor(Math.random() * questionIDs.length);
    return questionIDs[randomIndex].questionID;
  }

  async getQuestionByID(questionID) {
    return await this.model.findOne({ questionID }).exec();
  }

  //   async checkAnswer(questionID, userAnswer) {
  //     try {
  //       // Fetch the correct answer for the given questionID
  //       const quiz = await this.model.findOne({ questionID }, { answer: 1 }).exec();

  //       if (!quiz) {
  //         throw new Error(`No quiz found with questionID: ${questionID}`);
  //       }

  //       // Compare the user's answer with the correct answer
  //       return quiz.answer === userAnswer;
  //     } catch (error) {
  //       throw new Error(`Failed to check answer: ${error.message}`);
  //     }
  //   }
}
