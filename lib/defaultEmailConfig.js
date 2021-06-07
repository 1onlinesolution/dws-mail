// =============================================
// See more at:
// https://nodemailer.com/smtp/
//
/* eslint-disable indent */
const emailConfig = ({
  username = process.env.EMAIL_USERNAME,
  password = process.env.EMAIL_PASSWORD,
  host = process.env.EMAIL_HOST,
  smtpPort = 587,
  secure =  smtpPort === 465,
  rejectUnauthorized = false,
}) => {
  return {
    // Is the hostname or IP address to connect to (defaults to ‘localhost’)
    host: host,

    // Is the port to connect to (defaults to 587 if is secure is false or 465 if true)
    port: smtpPort,

    // If true the connection will use TLS when connecting to server.
    // If false (the default) then TLS is used if server supports the STARTTLS extension.
    // In most cases set this value to true if you are connecting to port 465.
    // For port 587 or 25 keep it false.
    secure: smtpPort === secure,

    // Defines authentication data
    auth: {
      user: username,
      pass: password,
    },

    // Defines additional node.js TLSSocket options to be passed to the socket constructor, eg. {rejectUnauthorized: true}.
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: rejectUnauthorized || false,
    },
  };
};
/* eslint-enable indent */

module.exports = emailConfig;
