// https://javascript.info/custom-errors

const MESSAGE = 'SMTP configuration cannot be undefined or null';

class SmtpConfigurationError extends Error {
  constructor(message = MESSAGE) {
    super(message);
    this.name = 'SmtpConfigurationError'; // (2)
  }
}

module.exports = SmtpConfigurationError;
