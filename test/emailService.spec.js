const assert = require('assert');
const EmailService = require('../lib/emailService');
const emailConfig = require('../lib/defaultEmailConfig')({});

describe('EmailHandler', () => {
  const message = {
    from: process.env.EMAIL_USERNAME,
    to: process.env.EMAIL_USERNAME,
    subject: 'Testing EmailService',
    text: 'This email is the result of testing (emailService.spec.js)',
  };

  it('Ctor throws if not provided with a configuration', (done) => {
    assert.throws(() => {
      new EmailService();
    }, /configuration cannot be undefined or null/);
    // or this (see passwordService.spec.js for async/await example):
    try {
        new EmailService();
    }
    catch(err){
        assert(err.name === 'SmtpConfigurationError');
        assert(err.message === 'SMTP configuration cannot be undefined or null');
    }
    done();
  });

  it('sendMail sends email', (done) => {
    const emailService = new EmailService({
      ...emailConfig,
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });

    emailService
      .sendEmail(message)
      .then((result) => {
        assert(result.ok === 1);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
