import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);

export const contactsTable = base(process.env.AIRTABLE_TABLE_ID!);
export const researchTable = base(process.env.AIRTABLE_RESEARCH_TABLE_ID!);

export type Contact = {
  id: string;
  Name: string;
  Company: string;
  Title: string;
  Email: string;
  LinkedIn: string;
  Cateogry: string; // typo in Airtable field name
  Stage: string;
  "LinkedIn Friended": boolean;
  "Follow-Up Enabled": boolean;
  "Last Contacted": string;
  "Follow-Up Count": number;
  "Last Follow-Up Date": string;
  "Company Intel": string;
  Notes: string;
};

export type ResearchRequest = {
  id: string;
  Company: string;
  Context: string;
  Status: string;
  "Results Count": number;
  "Company Intel": string;
  Created: string;
};

export function recordToResearch(record: Airtable.Record<any>): ResearchRequest {
  const f = record.fields;
  return {
    id: record.id,
    Company: (f.Company as string) || "",
    Context: (f.Context as string) || "",
    Status: (f.Status as string) || "Pending",
    "Results Count": (f["Results Count"] as number) || 0,
    "Company Intel": (f["Company Intel"] as string) || "",
    Created: (f.Created as string) || "",
  };
}

export function recordToContact(record: Airtable.Record<any>): Contact {
  const f = record.fields;
  return {
    id: record.id,
    Name: (f.Name as string) || "",
    Company: (f.Company as string) || "",
    Title: (f.Title as string) || "",
    Email: (f.Email as string) || "",
    LinkedIn: (f.LinkedIn as string) || "",
    Cateogry: (f.Cateogry as string) || "",
    Stage: (f.Stage as string) || "New",
    "LinkedIn Friended": !!f["LinkedIn Friended"],
    "Follow-Up Enabled": !!f["Follow-Up Enabled"],
    "Last Contacted": (f["Last Contacted"] as string) || "",
    "Follow-Up Count": (f["Follow-Up Count"] as number) || 0,
    "Last Follow-Up Date": (f["Last Follow-Up Date"] as string) || "",
    "Company Intel": (f["Company Intel"] as string) || "",
    Notes: (f.Notes as string) || "",
  };
}
