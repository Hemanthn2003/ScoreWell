import nodemailer from "nodemailer";

const transporter =
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(
      process.env.EMAIL_PORT || 587
    ),
    secure:
      Number(
        process.env.EMAIL_PORT || 587
      ) === 465,

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

export const sendPasswordResetOtp = async (
  email: string,
  otp: string
): Promise<void> => {
  const from =
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER;

  await transporter.sendMail({
    from,

    to: email,

    subject:
      "ScoreWell Password Reset OTP",

    text: `Your ScoreWell password reset OTP is ${otp}. This OTP is valid for 10 minutes. If you did not request a password reset, you can ignore this email.`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        background:#f8fafc;
        padding:40px 20px;
      ">
        <div style="
          max-width:560px;
          margin:0 auto;
          background:white;
          border-radius:18px;
          padding:35px;
          border:1px solid #e9d5ff;
          box-shadow:0 10px 40px rgba(91,33,182,0.10);
        ">

          <h2 style="
            color:#581c87;
            margin-bottom:8px;
          ">
            ScoreWell
          </h2>

          <p style="
            color:#475569;
            font-size:15px;
          ">
            Password Reset Request
          </p>

          <p style="
            color:#334155;
            line-height:1.6;
          ">
            Use the following OTP to reset your
            ScoreWell account password:
          </p>

          <div style="
            margin:25px 0;
            text-align:center;
          ">
            <span style="
              display:inline-block;
              padding:16px 30px;
              border-radius:12px;
              background:#f3e8ff;
              color:#6b21a8;
              font-size:30px;
              font-weight:700;
              letter-spacing:8px;
            ">
              ${otp}
            </span>
          </div>

          <p style="
            color:#64748b;
            font-size:14px;
          ">
            This OTP is valid for 10 minutes.
          </p>

          <p style="
            color:#64748b;
            font-size:14px;
          ">
            If you did not request a password reset,
            please ignore this email.
          </p>

        </div>
      </div>
    `,
  });
};