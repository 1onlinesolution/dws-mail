const nodemailer = require('nodemailer');
const Validity = require('@1onlinesolution/dws-utils/lib/validity');
const MailServerError = require('./mailServerError');
const SmtpConfigurationError = require('./smtpConfigurationError');
const emailConfig = require('./defaultEmailConfig');

// create reusable transporter object using the default SMTP transport
const createTransporterFromConfiguration = (smtpConfig) => nodemailer.createTransport({ ...smtpConfig });

class EmailService {
  constructor(smtpConfig) {
    if (!smtpConfig) {
      throw new SmtpConfigurationError();
    }

    this.smtpConfig = smtpConfig;
  }

  createTransporter() {
    // create reusable transporter object using the default SMTP transport
    return createTransporterFromConfiguration(this.smtpConfig);
  }

  closeTransporter(transporter) {
    // only needed when using pooled connections
    transporter.close();
  }

  async sendOneOfEmails(transporter, message) {
    const notProduction = process.env.NODE_ENV !== 'production';

    try {
      await transporter.verify();
      const info = await transporter.sendMail(message);

      const { rejected, response, envelope, messageId } = info;

      return {
        envelope: envelope,
        response: response,
        messageId: messageId,
        ok: rejected.length <= 0 ? 1 : 0,
      };
    } catch (err) {
      const { code, command, responseCode, response, stack } = err;
      let msg = `code = ${code}, command = ${command}, responseCode = ${responseCode}, response = ${response}`;
      if (notProduction) {
        msg = `${msg}, stack = ${stack}`;
      }
      return Promise.reject(new MailServerError(msg));
    }
  }

  async sendEmail(message) {
    const err_message = 'cannot send email: invalid';
    if (!message || !message.from || !message.to || !message.subject || (!message.text && !message.html))
      return Promise.reject(new Error(`${err_message} message`));

    if (!Validity.isValidString(message.from, 6)) return new Error(`${err_message} 'from' email`);
    if (!Validity.isValidString(message.to, 6)) return new Error(`${err_message} 'to' email(s)`);
    if (message.cc && !Validity.isValidString(message.cc, 6)) return new Error(`${err_message} 'cc' email(s)`);
    if (message.bcc && !Validity.isValidString(message.bcc, 6)) return new Error(`${err_message} 'bcc' email(s)`);

    if (!this.smtpConfig.host) return Promise.reject(new Error(`${err_message} host`));
    if (!this.smtpConfig.auth.user) return Promise.reject(new Error(`${err_message} username`));
    if (!this.smtpConfig.auth.pass) return Promise.reject(new Error(`${err_message} password`));

    const notProduction = process.env.NODE_ENV !== 'production';

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport(this.smtpConfig);
    try {
      await transporter.verify();
      const info = await transporter.sendMail(message);
      transporter.close(); // only needed when using pooled connections
      return info;
    } catch (err) {
      const { code, command, responseCode, response, stack } = err;
      let msg = `code = ${code}, command = ${command}, responseCode = ${responseCode}, response = ${response}`;
      if (notProduction) {
        msg = `${msg}, stack = ${stack}`;
      }
      return Promise.reject(new MailServerError(msg));
    }
  }

  static async send({
    message,
    email_host = process.env.EMAIL_HOST,
    email_username = process.env.EMAIL_USERNAME,
    email_password = process.env.EMAIL_PASSWORD,
  }) {
    // =============================================
    // See more at:
    // https://nodemailer.com/smtp/
    const config = emailConfig({
      host: email_host,
      username: email_username,
      password: email_password,
    });

    const emailService = new EmailService(config);
    return await emailService.sendEmail(message);
  }
}

module.exports = EmailService;
