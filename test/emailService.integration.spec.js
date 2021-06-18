const assert = require('assert');
const EmailService = require('../lib/emailService');
const emailConfig = require('../lib/defaultEmailConfig')({});

const isIntegrationTest = process.env.NODE_ENV === 'test_integration';

describe('*** Integration tests *** EmailHandler', () => {
  it('sendEmail sends one email', function (done) {
    if (!isIntegrationTest) {
      this.skip();
      return;
    }

    const message = {
      from: process.env.EMAIL_USERNAME,
      to: process.env.EMAIL_USERNAME,
      subject: 'Testing EmailService',
      text: 'This email is the result of testing (emailService.spec.js)',
    };

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
        const { accepted, rejected, response } = result;
        assert(rejected.length === 0);
        assert(accepted.length === 1);
        assert(accepted[0] === message.to);
        assert(response.includes('250 2.0.0 Ok: queued as'));
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('send sends one email', function (done) {
    if (!isIntegrationTest) {
      this.skip();
      return;
    }

    const message = {
      from: process.env.EMAIL_USERNAME,
      to: process.env.EMAIL_USERNAME,
      subject: 'Testing EmailService',
      text: 'This email is the result of testing (emailService.spec.js)',
    };
    EmailService.send({ message })
      .then((result) => {
        const { accepted, rejected, response } = result;
        assert(rejected.length === 0);
        assert(accepted.length === 1);
        assert(accepted[0] === message.to);
        assert(response.includes('250 2.0.0 Ok: queued as'));
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('send sends multiple emails', function (done) {
    if (!isIntegrationTest) {
      this.skip();
      return;
    }

    const message = {
      from: process.env.EMAIL_USERNAME,
      to: `${process.env.EMAIL_USERNAME},${process.env.EMAIL_USERNAME2}`,
      subject: 'Testing EmailService',
      text: 'This email is the result of testing (emailService.spec.js)',
    };
    EmailService.send({ message })
      .then((result) => {
        const { accepted, rejected, response } = result;
        assert(rejected.length === 0);
        assert(accepted.length === 2);
        const recipients = message.to.split(',');
        assert(accepted[0] === recipients[0]);
        assert(accepted[1] === recipients[1]);
        assert(response.includes('250 2.0.0 Ok: queued as'));
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('send sends multiple emails through cc', function (done) {
    if (!isIntegrationTest) {
      this.skip();
      return;
    }

    const message = {
      from: process.env.EMAIL_USERNAME,
      to: process.env.EMAIL_USERNAME,
      cc: process.env.EMAIL_USERNAME2,
      subject: 'Testing EmailService',
      text: 'This email is the result of testing (emailService.spec.js)',
    };
    EmailService.send({ message })
      .then((result) => {
        const { accepted, rejected, response } = result;
        assert(rejected.length === 0);
        assert(accepted.length === 2);
        assert(accepted[0] === message.to);
        assert(accepted[1] === message.cc);
        assert(response.includes('250 2.0.0 Ok: queued as'));
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('send sends multiple emails through bcc', function (done) {
    if (!isIntegrationTest) {
      this.skip();
      return;
    }

    const message = {
      from: process.env.EMAIL_USERNAME,
      to: process.env.EMAIL_USERNAME,
      bcc: process.env.EMAIL_USERNAME2,
      subject: 'Testing EmailService',
      text: 'This email is the result of testing (emailService.spec.js)',
    };
    EmailService.send({ message })
      .then((result) => {
        const { accepted, rejected, response } = result;
        assert(rejected.length === 0);
        assert(accepted.length === 2);
        assert(accepted[0] === message.to);
        assert(accepted[1] === message.bcc);
        assert(response.includes('250 2.0.0 Ok: queued as'));
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

