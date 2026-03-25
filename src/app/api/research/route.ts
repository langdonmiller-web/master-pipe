import { NextRequest, NextResponse } from "next/server";
import { researchTable, recordToResearch, contactsTable, recordToContact } from "@/lib/airtable";

export async function GET() {
  try {
    const records = await researchTable.select({ sort: [{ field: "Created", direction: "desc" }] }).all();
    const requests = records.map(recordToResearch);

    // For each "Done" request, also fetch matching contacts
    const allContacts = await contactsTable.select().all();
    const contactsByCompany: Record<string, ReturnType<typeof recordToContact>[]> = {};

    for (const record of allContacts) {
      const contact = recordToContact(record);
      const notes = contact.Notes || "";
      const match = notes.match(/^Via research: (.+)$/);
      if (match) {
        const company = match[1];
        if (!contactsByCompany[company]) contactsByCompany[company] = [];
        contactsByCompany[company].push(contact);
      }
    }

    return NextResponse.json({
      requests,
      contactsByCompany,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { company, context } = await req.json();

    if (!company) {
      return NextResponse.json({ error: "Company name required" }, { status: 400 });
    }

    const record = await researchTable.create({
      Company: company,
      Context: context || "",
      Status: "Pending",
      Created: new Date().toISOString().split("T")[0],
    });

    return NextResponse.json(recordToResearch(record));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
