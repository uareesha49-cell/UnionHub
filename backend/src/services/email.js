import nodemailer from "nodemailer";

// Lazy-initialized transporter
let transporter = null;
let isTransporterVerified = false;

// Initialize transporter only when needed (after env variables are loaded)
function initializeTransporter() {
  if (transporter) return;

  console.log("[Email Service] Initializing email transporter...");
  console.log(`[Email Service] EMAIL_USER: ${process.env.EMAIL_USER ? "Set" : "NOT SET"}`);
  console.log(`[Email Service] EMAIL_PASS: ${process.env.EMAIL_PASS ? "Set" : "NOT SET"}`);
  console.log(`[Email Service] EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || "gmail (default)"}`);

  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail", // Default to gmail, or use host/port
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verify transporter connection
  transporter.verify(function (error, success) {
    if (error) {
      console.error("[Email Service] Transporter verification failed:", error);
    } else {
      console.log("[Email Service] Transporter is ready to send emails!");
      isTransporterVerified = true;
    }
  });
}

export async function sendOtpEmail(to, otp) {
  console.log(`[Email Service] Attempting to send OTP email to: ${to}`);
  
  initializeTransporter();

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Skipping email send: EMAIL_USER or EMAIL_PASS not set.");
    console.log(`[MOCK EMAIL] To: ${to}, OTP: ${otp}`);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Password Reset OTP - Union Hub",
    text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
    html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>It expires in 10 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] OTP email sent successfully! Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("[Email Service] Failed to send OTP email:", error);
    throw error;
  }
}

export async function sendBroadcastEmail(bcc, subject, htmlContent) {
  console.log(`[Email Service] Attempting to send broadcast email to ${bcc.length} recipients`);
  console.log(`[Email Service] Bcc list:`, bcc);
  console.log(`[Email Service] Sender email:`, process.env.EMAIL_USER);
  
  initializeTransporter();

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Skipping email send: EMAIL_USER or EMAIL_PASS not set.");
    console.log(`[MOCK EMAIL] Bcc: ${bcc.length} recipients, Subject: ${subject}`);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Set 'to' to sender to make Gmail happy
    bcc, // Use BCC to hide recipients from each other
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Broadcast email sent successfully! Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("[Email Service] Failed to send broadcast email:", error);
    throw error;
  }
}
