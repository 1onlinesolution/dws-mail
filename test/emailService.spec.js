const assert = require('assert');
const sinon = require('sinon');
const EmailService = require('../lib/emailService');
const emailConfig = require('../lib/defaultEmailConfig')({});

describe('*** Unit tests *** Ctor', function () {
  it('throws if not provided with a configuration', function (done) {
    assert.throws(() => {
      new EmailService();
    }, /configuration cannot be undefined or null/);
    // or this (see passwordService.spec.js for async/await example):
    try {
      new EmailService();
    } catch (err) {
      assert(err.name === 'SmtpConfigurationError');
      assert(err.message === 'SMTP configuration cannot be undefined or null');
    }
    done();
  });
});

describe('*** Unit tests *** EmailHandler', function () {
  let sandbox = null;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('EmailService.sendEmail sends one email', async function () {
    const message = {
      from: 'fromEmail',
      to: 'toEmail',
      subject: 'Testing EmailService',
      text: 'This email is the result of testing (emailService.spec.js)',
    };

    const sendEmail = sandbox.stub(EmailService.prototype, 'sendEmail').resolves(true);
    const emailService = new EmailService({
      ...emailConfig,
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });
    const result = await emailService.sendEmail(message);
    assert(result);
    sinon.assert.calledOnce(sendEmail);
  });

  it('EmailService.send sends one email', async function () {
    const message = {
      from: 'fromEmail',
      to: 'toEmail',
      subject: 'Testing EmailService',
      text: 'This email is the result of testing (emailService.spec.js)',
    };

    const send = sandbox.stub(EmailService, 'send').resolves(true);
    const result = await EmailService.send({ message });
    assert(result);
    sinon.assert.calledOnce(send);
  });

  it('EmailService.send sends multiple emails', async function () {
    const message = {
      from: 'fromEmail',
      to: 'toEmail,andAnotherOne',
      subject: 'Testing EmailService',
      text: 'This email is the result of testing (emailService.spec.js)',
    };

    const sendEmail = sandbox.stub(EmailService, 'send').resolves(true);
    const result = await EmailService.send({ message });
    assert(result);
    sinon.assert.calledOnce(sendEmail);
  });

  it('EmailService.send sends multiple emails through cc', async function () {
    const message = {
      from: 'fromEmail',
      to: 'toEmail',
      cc: 'andAnotherOne',
      subject: 'Testing EmailService',
      text: 'This email is the result of testing (emailService.spec.js)',
    };

    const sendEmail = sandbox.stub(EmailService, 'send').resolves(true);
    const result = await EmailService.send({ message });
    assert(result);
    sinon.assert.calledOnce(sendEmail);
  });

  it('EmailService.send sends multiple emails through bcc', async function () {
    const message = {
      from: 'fromEmail',
      to: 'toEmail',
      bcc: 'andAnotherOne',
      subject: 'Testing EmailService',
      text: 'This email is the result of testing (emailService.spec.js)',
    };

    const sendEmail = sandbox.stub(EmailService, 'send').resolves(true);
    const result = await EmailService.send({ message });
    assert(result);
    sinon.assert.calledOnce(sendEmail);
  });
});
