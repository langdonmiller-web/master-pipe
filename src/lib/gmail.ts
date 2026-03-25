import { ImapFlow } from "imapflow";

// ──────────────────────────────────────────────────────────────────────────
// IMAP-based Gmail draft creation.
//
// WHY IMAP: Google's OAuth scopes bundle draft creation with send permission.
// IMAP has NO send capability — it can only read mailboxes and append to
// folders. Sending requires SMTP (a separate protocol) which this app does
// NOT use or import. This is an architectural guarantee, not a code-level
// block.
//
// WHAT THIS CAN DO:
//   - Append a message to [Gmail]/Drafts (creates a draft)
//   - Read messages/threads (for detecting sent status)
//
// WHAT THIS CANNOT DO:
//   - Send emails (requires SMTP — not imported, not used)
//   - Delete emails (we never call delete)
// ──────────────────────────────────────────────────────────────────────────

function getImapConfig() {
  return {
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.GMAIL_ADDRESS!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
    logger: false as const,
  };
}

export function isGmailConnected(): boolean {
  return !!(process.env.GMAIL_ADDRESS && process.env.GMAIL_APP_PASSWORD);
}

// HTML signature extracted from Langdon's actual Gmail signature
const SIGNATURE_HTML = `<span class="gmail_signature_prefix">-- </span><br><div dir="ltr" class="gmail_signature" data-smartmail="gmail_signature"><div style="font-family:Verdana,Geneva,sans-serif;font-size:12px"><span style="font-size:14px;font-family:arial,helvetica,sans-serif"><strong>Langdon Miller | </strong>  Senior Director, Inventory Partnerships </span></div><div style="font-family:Verdana,Geneva,sans-serif;font-size:10px;line-height:1.0"><span style="font-size:12px;font-family:arial,helvetica,sans-serif"> Mobile: <a href="tel:+1+415-722-0855" target="_blank">+1 415-722-0855</a></span><br><span style="font-size:12px;font-family:arial,helvetica,sans-serif">  826 Broadway, 4th Floor, New York, NY 10003 <br><br></span></div><div style="line-height:2.0"><span style="font-family:arial,helvetica,sans-serif"><a style="text-decoration:none" href="https://kargo.com" target="_blank"><img src="https://cdn.bulksignature.com/images/587/v8cpXPfl1rEAvTkJAj2y3L0IZFjh2KN6df1ArUoa.gif" alt="" width="270" height="65"></a></span></div></div>`;

/**
 * Converts plain text body to simple HTML, preserving line breaks.
 */
function textToHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>\n");
}

/**
 * Creates a draft in Gmail by appending to the Drafts folder via IMAP.
 * IMAP cannot send emails — that requires SMTP which is not used here.
 * Creates HTML emails with Langdon's full branded signature.
 */
export async function createGmailDraft(
  to: string,
  subject: string,
  body: string
) {
  if (!isGmailConnected()) {
    throw new Error("Gmail not configured. Set GMAIL_ADDRESS and GMAIL_APP_PASSWORD in .env.local");
  }

  const client = new ImapFlow(getImapConfig());

  // Build HTML body with signature
  const htmlBody = `<div dir="ltr">
${textToHtml(body)}
<br>
${SIGNATURE_HTML}
</div>`;

  try {
    await client.connect();

    // Build a raw RFC 2822 HTML email message
    const message = [
      `From: Langdon Miller <${process.env.GMAIL_ADDRESS}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: text/html; charset="UTF-8"`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      "",
      htmlBody,
    ].join("\r\n");

    // Append to Drafts with the \Draft flag
    const result = await client.append("[Gmail]/Drafts", message, ["\\Draft"]);

    return { id: result && typeof result === 'object' && 'uid' in result ? result.uid?.toString() : "created", success: true };
  } finally {
    await client.logout().catch(() => {});
  }
}
