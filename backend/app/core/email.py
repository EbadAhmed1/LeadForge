"""
app/core/email.py
──────────────────
Email service using the Resend REST API (via httpx).
"""
from __future__ import annotations

import structlog
import httpx

from app.core.config import get_settings

settings = get_settings()
logger = structlog.get_logger(__name__)

RESEND_SEND_URL = "https://api.resend.com/emails"


async def send_email(to: str, subject: str, html: str) -> bool:
    """Send a transactional email via Resend. Returns True on success."""
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY not set — skipping email", to=to, subject=subject)
        return False

    payload = {
        "from": settings.email_from,
        "to": [to],
        "subject": subject,
        "html": html,
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                RESEND_SEND_URL,
                json=payload,
                headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            )
        resp.raise_for_status()
        return True
    except Exception as exc:
        logger.error("Failed to send email", to=to, error=str(exc))
        return False


async def send_verification_email(to: str, name: str, code: str) -> bool:
    """Send the 6-digit email verification code."""
    subject = "Your LeadForge verification code"
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #1C1917; margin-bottom: 8px;">Verify your email</h2>
      <p style="color: #57534E; margin-bottom: 24px;">
        Hi {name}, enter the code below in LeadForge to confirm your email address.
        This code expires in <strong>15 minutes</strong>.
      </p>
      <div style="background: #FAF7F2; border: 1px solid #E8E3D9; border-radius: 12px;
                  padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px;
                     color: #C2410C; font-family: monospace;">{code}</span>
      </div>
      <p style="color: #78716C; font-size: 13px;">
        If you didn't create a LeadForge account, you can safely ignore this email.
      </p>
    </div>
    """
    return await send_email(to, subject, html)
