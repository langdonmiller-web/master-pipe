import { NextRequest, NextResponse } from "next/server";
import { contactsTable, recordToContact } from "@/lib/airtable";

export async function GET() {
  try {
    const records = await contactsTable.select().all();
    const contacts = records.map(recordToContact);
    return NextResponse.json(contacts);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Deduplication: check if contact already exists by email, LinkedIn URL, or name+company
    const existing = await contactsTable.select().all();
    const duplicate = existing.find((r) => {
      const f = r.fields;
      // Match by email (strongest signal)
      if (body.Email && f.Email && (f.Email as string).toLowerCase() === body.Email.toLowerCase()) {
        return true;
      }
      // Match by LinkedIn URL
      if (body.LinkedIn && f.LinkedIn && normalizeLinkedIn(f.LinkedIn as string) === normalizeLinkedIn(body.LinkedIn)) {
        return true;
      }
      // Match by name + company (fuzzy)
      if (
        body.Name && f.Name && body.Company && f.Company &&
        (f.Name as string).toLowerCase().trim() === body.Name.toLowerCase().trim() &&
        (f.Company as string).toLowerCase().trim() === body.Company.toLowerCase().trim()
      ) {
        return true;
      }
      return false;
    });

    if (duplicate) {
      return NextResponse.json({
        ...recordToContact(duplicate),
        _deduplicated: true,
      });
    }

    const record = await contactsTable.create({
      Name: body.Name,
      Company: body.Company,
      Title: body.Title || "",
      Email: body.Email || "",
      LinkedIn: body.LinkedIn || "",
      Cateogry: body.Cateogry || "",
      Stage: "New",
      Notes: body.Notes || "",
    });
    return NextResponse.json(recordToContact(record));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function normalizeLinkedIn(url: string): string {
  // Strip trailing slashes, query params, normalize to lowercase
  return url.toLowerCase().replace(/\/+$/, "").split("?")[0].replace(/^https?:\/\/(www\.)?/, "");
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...fields } = body;
    const record = await contactsTable.update(id, fields);
    return NextResponse.json(recordToContact(record));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
