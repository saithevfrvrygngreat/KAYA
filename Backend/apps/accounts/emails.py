import os
from datetime import datetime
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

def send_password_reset_otp_email(to_email, otp):
    print("\n" + "=" * 50)
    print(f"🔑 [KaYa Security] Password Reset OTP for {to_email}:")
    print(f"   OTP CODE: {otp}")
    print(f"   Valid for 10 minutes")
    print("=" * 50 + "\n")

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>KaYa Password Reset Code</title>
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0a09; color: #f5f5f4; margin: 0; padding: 24px; }}
        .card {{ max-width: 480px; margin: 0 auto; background: #1c1917; border: 1px solid #292524; border-radius: 20px; padding: 36px 32px; box-shadow: 0 10px 35px rgba(0,0,0,0.5); }}
        .logo {{ font-size: 26px; font-weight: 800; letter-spacing: 4px; color: #ffffff; text-align: center; margin-bottom: 24px; }}
        .title {{ font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; text-align: center; }}
        .desc {{ font-size: 14px; line-height: 1.6; color: #a8a29e; text-align: center; margin-bottom: 28px; }}
        .otp-box {{ background: #0c0a09; border: 1px solid #44403c; border-radius: 14px; padding: 18px; text-align: center; letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #ffffff; margin-bottom: 28px; font-family: monospace; }}
        .footer {{ font-size: 12px; color: #78716c; text-align: center; line-height: 1.5; border-top: 1px solid #292524; padding-top: 20px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">KAYA</div>
        <div class="title">Password Reset Verification</div>
        <p class="desc">We received a request to reset the password for your KaYa account. Use the 6-digit code below to proceed with your password update:</p>
        <div class="otp-box">{otp}</div>
        <p class="desc" style="font-size: 13px; color: #78716c;">This verification code is valid for <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this email.</p>
        <div class="footer">
          &copy; {datetime.now().year} KaYa Bespoke Spatial Interiors. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    """

    subject = f"Your KaYa Password Reset Code: {otp}"
    text_content = f"Your KaYa password reset code is: {otp}. It is valid for 10 minutes."
    from_email = settings.EMAIL_FROM

    try:
        msg = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        print(f"✉️ [EmailService] OTP email dispatched to {to_email}")
        return {'sent': True, 'otp': otp}
    except Exception as e:
        print(f"⚠️ [EmailService] SMTP error ({str(e)}). OTP logged to console.")
        return {'sent': False, 'error': str(e), 'otp': otp}
