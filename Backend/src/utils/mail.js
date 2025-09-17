const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL, // generated ethereal user
    pass: process.env.PASS, // generated ethereal password
  },
});


exports.sendOtpEmail = async (to, otp) => {
    
    await transporter.sendMail({
        from: `"Vingo Support" <${process.env.EMAIL}>`, // sender address
        to, // list of receivers
        subject: "Your OTP Code", // Subject line
        text: `Your OTP code is ${otp}. It is valid for 10 minutes.`, // plain text body
        html: `<p>Your OTP code is <b>${otp}</b>. It is valid for 10 minutes.</p>`, // html body
    })
}
