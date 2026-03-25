import { NextRequest, NextResponse } from "next/server";
import { contactsTable, recordToContact } from "@/lib/airtable";
import { createGmailDraft, isGmailConnected } from "@/lib/gmail";

export async function POST(req: NextRequest) {
  try {
    const { contacts: contactsList } = await req.json();

    // Support both single contact and bulk contacts
    const items: { contactId: string; email: string; name: string; company: string; title: string; category: string; companyIntel: string }[] =
      Array.isArray(contactsList) ? contactsList : [contactsList];

    const results = [];

    for (const item of items) {
      const { contactId, email, name, company, title, category, companyIntel } = item;

      if (!email) {
        results.push({ contactId, error: "No email address", skipped: true });
        continue;
      }

      const firstName = name.split(" ")[0];

      // Use Company Intel for tailored inventory description, fall back to category, then generic
      const inventoryType = companyIntel || category || "digital media";

      const subject = `Bringing $1B in Brand Demand to ${company || firstName}`;

      const body = `Hi ${firstName},

I'm reaching out from Kargo -- we're a brand advertising technology company with over $1B in Fortune 500 brand/agency/performance spend and unique creative formats flowing through our pipes annually.

We're actively looking for ${inventoryType} inventory partners, and given ${company}'s audience and ad environment, I think there could be a strong fit here. More and more of our advertisers have been asking for ${inventoryType} placements, and we'd love to explore what a partnership could look like.

Would you be open to a quick call to talk through it?

Langdon`;

      // Push draft to Gmail via IMAP
      let gmailDraftId: string | null = null;
      let gmailConnected = false;

      if (isGmailConnected()) {
        gmailConnected = true;
        try {
          const draft = await createGmailDraft(email, subject, body);
          gmailDraftId = draft.id || null;
        } catch (e: any) {
          console.error("Failed to create Gmail draft for", email, e.message);
        }
      }

      // Move to "Outreach Ready" — draft is now in Gmail.
      // Scheduled task detects when you actually send it → moves to "Sent".
      // This app NEVER sends emails.
      const updatedRecord = await contactsTable.update(contactId, {
        Stage: "Outreach Ready",
        "Follow-Up Enabled": true,
        "Last Contacted": new Date().toISOString().split("T")[0],
      });

      results.push({
        contact: recordToContact(updatedRecord),
        draft: { to: email, subject, body },
        gmailDraftId,
        gmailConnected,
      });
    }

    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
