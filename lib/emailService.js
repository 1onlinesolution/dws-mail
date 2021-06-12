const nodemailer = require('nodemailer');
const MailServerError = require('./mailServerError');
const SmtpConfigurationError = require('./smtpConfigurationError');
const emailConfig = require('./defaultEmailConfig')({});

// create reusable transporter object using the default SMTP transport
const createTransporterFromConfiguration = (smtpConfig) => nodemailer.createTransport({...smtpConfig});

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
    const notProduction = process.env.NODE_ENV !== 'production';

    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport(this.smtpConfig);
    try {
      await transporter.verify();
      const info = await transporter.sendMail(message);
      transporter.close();  // only needed when using pooled connections
      return Promise.resolve(info);
    } catch (err) {
      const { code, command, responseCode, response, stack } = err;
      let msg = `code = ${code}, command = ${command}, responseCode = ${responseCode}, response = ${response}`;
      if (notProduction) {
        msg = `${msg}, stack = ${stack}`;
      }
      return Promise.reject(new MailServerError(msg));
    }
  }

  static async sendMail({ message, email_username = process.env.EMAIL_USERNAME, email_password = process.env.EMAIL_PASSWORD }) {
    const err_message = 'cannot send email: invalid or no email';
    if (!message) return Promise.reject(new Error(`${err_message} message`));
    if (!email_username) return Promise.reject(new Error(`${err_message} username`));
    if (!email_password) return Promise.reject(new Error(`${err_message} password`));

    // =============================================
    // See more at:
    // https://nodemailer.com/smtp/
    //
    const emailService = new EmailService({...emailConfig});

    try {
      await emailService.sendEmail(message);
      // `The message from '${message.from}' with subject '${message.subject}', was 'successfully' sent to '${message.to}'`
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

module.exports = EmailService;
