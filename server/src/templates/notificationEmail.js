module.exports = function notificationEmailTemplate({ title, body, actionUrl, actionText }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; padding: 40px 20px; }
  .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  .logo { color: #4f46e5; font-size: 24px; font-weight: 700; margin-bottom: 24px; }
  .btn { display: inline-block; background: #4f46e5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
  .footer { color: #71717a; font-size: 12px; margin-top: 32px; text-align: center; }
</style></head>
<body><div class="container">
  <div class="logo">Freiwilliger</div>
  <h2 style="color:#18181b;margin:0 0 12px">${title}</h2>
  <p style="color:#52525b;line-height:1.6">${body}</p>
  ${actionUrl ? `<a href="${actionUrl}" class="btn">${actionText || 'View Details'}</a>` : ''}
  <div class="footer">&copy; Freiwilliger &mdash; Find volunteer work near you</div>
</div></body>
</html>`;
};
