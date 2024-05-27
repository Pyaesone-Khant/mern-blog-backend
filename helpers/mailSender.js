const nodeMailer = require('nodemailer');

const sendEmail = async (email, subject, text) => {
    try {

        const transporter = nodeMailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            text: text
        };

        try {
            const result = await transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('Error sending email:', error.message);
            throw new Error(error);
        }
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = sendEmail;