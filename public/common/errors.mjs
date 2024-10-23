export class HTTPError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export class CancelledException extends Error {}
