// https://javascript.info/custom-errors

class MailServerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MailServerError';
  }
}

module.exports = MailServerError;
