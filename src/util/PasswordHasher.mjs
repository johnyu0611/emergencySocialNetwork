import * as argon2 from "argon2";

export class PasswordHasher {
  #options;

  constructor(options) {
    this.#options = options;
  }

  async hash(password) {
    return await argon2.hash(password, this.#options);
  }

  async verify(digest, password) {
    return await argon2.verify(digest, password, this.#options);
  }
}
