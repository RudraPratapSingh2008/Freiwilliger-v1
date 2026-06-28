module.exports = function emailVerificationTemplate(otp) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; padding: 40px 20px; }
  .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  .logo { color: #4f46e5; font-size: 24px; font-weight: 700; margin-bottom: 24px; }
  .otp { background: #f0f0ff; border-radius: 8px; padding: 16px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4f46e5; margin: 24px 0; }
  .footer { color: #71717a; font-size: 12px; margin-top: 32px; text-align: center; }
</style></head>
<body><div class="container">
  <div class="logo">Freiwilliger</div>
  <h2 style="color:#18181b;margin:0 0 12px">Verify your email</h2>
  <p style="color:#52525b;line-height:1.6">Use this OTP to verify your email address. It expires in 10 minutes.</p>
  <div class="otp">${otp}</div>
  <p style="color:#71717a;font-size:13px">If you didn't request this, please ignore this email.</p>
  <div class="footer">&copy; Freiwilliger &mdash; Find volunteer work near you</div>
</div></body>
</html>`;
};
