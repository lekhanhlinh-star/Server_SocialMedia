const nodemailer = require('nodemailer');

// Truyền vào một options đây là một đối tượng chứa các thông tin như email user, subject, message

const sendEmail = async (options) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2. Define the email options
  const mailOptions = {
    from: 'Toan Nguyen <20110012@student.hcmute.edu.vn>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // 3. Actually send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
