import { NextRequest, NextResponse } from "next/server";
import { contactsTable, recordToContact } from "@/lib/airtable";

export async function POST(req: NextRequest) {
  try {
    const { contactId, name, company, linkedinUrl } = await req.json();

    // Update stage to Enriching
    await contactsTable.update(contactId, { Stage: "Enriching" });

    // Try Findymail API - search by LinkedIn URL first, then by name+company
    let email = "";

    if (linkedinUrl) {
      const res = await fetch(
        "https://app.findymail.com/api/search/linkedin",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.FINDYMAIL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ linkedin_url: linkedinUrl }),
        }
      );
      const data = await res.json();
      if (data.email) email = data.email;
    }

    if (!email && name && company) {
      const [first, ...rest] = name.split(" ");
      const last = rest.join(" ");
      const res = await fetch("https://app.findymail.com/api/search/name", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FINDYMAIL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: first,
          last_name: last,
          company_name: company,
        }),
      });
      const data = await res.json();
      if (data.email) email = data.email;
    }

    // Update the contact with email and new stage
    const updatedRecord = await contactsTable.update(contactId, {
      Email: email || "",
      Stage: email ? "Outreach Ready" : "New",
    });

    return NextResponse.json({
      contact: recordToContact(updatedRecord),
      found: !!email,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
