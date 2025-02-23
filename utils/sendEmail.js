import { Resend } from "resend";

export const sendVerifyEmail = async (to, otp) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: `Xventory <${process.env.FROM_EMAIL}>`,
      to,
      subject: "Verify your email",
      html: `
        <div>
          <div style="width: 70%; margin: 5rem auto;">
            <div style="padding: 0.5rem 0; border-bottom: 1px solid #EEE">
              <h2 style="color: #00466A;">Xventory</h2>
            </div>
            <p style="padding: 1.5rem 0;">Thank you for choosing Xventory. Use the following OTP to complete your Signup procedures. OTP is valid for 5 minutes</p>
            <h2 style="width: max-content; color: #FFF; background: #00466A; padding: 0.75rem; margin: 0 auto; border-radius: 0.5rem;">${otp}</h2>
            <p style="padding: 1.5rem 0; border-bottom: 1px solid #EEE">Regards,<br />Xventory</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.log(error.message);
  }
};
