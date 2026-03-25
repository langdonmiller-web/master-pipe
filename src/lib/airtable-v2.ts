/**
 * Airtable v2 Integration - Master Pipe v2
 * Comprehensive wrapper for all Airtable operations
 */

import Airtable, { FieldSet, Record } from "airtable";

// Initialize Airtable base
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!
);

// Table names - these will be created in the seed script
export const TABLES = {
  PARTNERS: "Partners",
  CONTACTS: "Contacts",
  OUTREACH_LOG: "Outreach Log",
  TICKETS: "Tickets",
  TIMELINE_EVENTS: "Timeline Events"
} as const;

// Type definitions for each table
export type Partner = {
  id: string;
  Name: string;
  Category: "App" | "DOOH" | "RMN Onsite" | "WiFi Portal" | "Travel Media" | "Onsite/Offsite" | "Other";
  "Sub Category"?: string;
  "Surface Type": "In-App" | "RMN Onsite" | "WiFi Portal" | "DOOH" | "Web" | "Other";
  Stage: "Prospecting" | "To Do" | "Outreach Sent" | "Meeting Booked" | "Negotiating" | "Integrating" | "Live - Crawl" | "Live" | "Paused" | "Not Interested" | "Dead";
  Priority: "Low" | "Med" | "High";
  Likelihood: "Low" | "Med" | "High";
  Owner: "Langdon Miller" | "Ben Balbona" | "Adrienne Ross" | "Jack";
  Description?: string;
  "Partnership Hypothesis"?: string;
  "Status Details & Action Items"?: string;
  Timeline?: string;
  "Current Monetization"?: string;
  "Approved Formats"?: string;
  Scale?: string;
  Materials?: string;
  Pricing?: string;
  Targeting?: string;
  "Contract Status": "None" | "NDA Sent" | "NDA Signed" | "MSA Drafting" | "MSA Redline" | "MSA Signed" | "Addendum Needed";
  "Integration Method"?: string;
  Intermediary?: string;
  "New Contract Point"?: string;
  "Spend Point"?: string;
  "Company Research"?: string;
  Website?: string;
  Stalled?: boolean;
  "Last Activity Date"?: string;
  Contacts?: string[]; // Link to Contacts table
};

export type Contact = {
  id: string;
  Name: string;
  Partner?: string[]; // Link to Partners
  Title?: string;
  Email?: string;
  LinkedIn?: string;
  Phone?: string;
  "Is Primary"?: boolean;
  Notes?: string;
  "Last Contacted"?: string;
};

export type OutreachLog = {
  id: string;
  Contact?: string[]; // Link to Contacts
  Partner?: string[]; // Link to Partners
  Channel: "Email" | "LinkedIn" | "Phone" | "Meeting" | "Slack" | "Other";
  Direction: "Outbound" | "Inbound";
  Subject?: string;
  Body?: string;
  Status: "Sent" | "Opened" | "Replied" | "Bounced" | "No Response";
  "Sent At": string;
  "Follow-up Due"?: string;
  "Follow-up Completed"?: boolean;
  "Gmail Message ID"?: string;
};

export type Ticket = {
  id: string;
  Title: string;
  Partner?: string[]; // Link to Partners
  Description?: string;
  "Assigned To": "Langdon" | "Ben" | "Jack" | "Adrienne";
  Priority: "Low" | "Medium" | "High" | "Urgent";
  Status: "Open" | "In Progress" | "Blocked" | "Done";
  "Due Date"?: string;
  "Created By"?: string;
};

export type TimelineEvent = {
  id: string;
  Partner?: string[]; // Link to Partners
  "Event Type": "Stage Change" | "Outreach" | "Meeting" | "Contract Update" | "Note" | "Ticket Created" | "Ticket Completed";
  Description: string;
  "Created By"?: string;
  Timestamp: string;
};

// Generic Airtable operations
export interface ListOptions {
  filterByFormula?: string;
  maxRecords?: number;
  pageSize?: number;
  sort?: Array<{ field: string; direction?: "asc" | "desc" }>;
  fields?: string[];
}

/**
 * List records from a table with pagination support
 */
export async function listRecords<T extends FieldSet>(
  tableName: string,
  options: ListOptions = {}
): Promise<Array<Record<T>>> {
  const records: Array<Record<T>> = [];

  const query = base(tableName).select({
    filterByFormula: options.filterByFormula,
    maxRecords: options.maxRecords,
    pageSize: options.pageSize || 100,
    sort: options.sort,
    fields: options.fields,
  });

  await query.eachPage((pageRecords, fetchNextPage) => {
    pageRecords.forEach(record => {
      records.push(record as Record<T>);
    });
    fetchNextPage();
  });

  return records;
}

/**
 * Get a single record by ID
 */
export async function getRecord<T extends FieldSet>(
  tableName: string,
  recordId: string
): Promise<Record<T>> {
  return await base(tableName).find(recordId);
}

/**
 * Create a new record
 */
export async function createRecord<T extends FieldSet>(
  tableName: string,
  fields: Partial<T>
): Promise<Record<T>> {
  const records = await base(tableName).create([{ fields }]);
  return records[0];
}

/**
 * Update an existing record
 */
export async function updateRecord<T extends FieldSet>(
  tableName: string,
  recordId: string,
  fields: Partial<T>
): Promise<Record<T>> {
  const records = await base(tableName).update([{ id: recordId, fields }]);
  return records[0];
}

/**
 * Delete a record
 */
export async function deleteRecord(
  tableName: string,
  recordId: string
): Promise<string> {
  const records = await base(tableName).destroy([recordId]);
  return records[0];
}

/**
 * Batch create multiple records
 */
export async function batchCreateRecords<T extends FieldSet>(
  tableName: string,
  records: Array<Partial<T>>
): Promise<Array<Record<T>>> {
  const chunks = [];
  const chunkSize = 10; // Airtable API limit

  for (let i = 0; i < records.length; i += chunkSize) {
    chunks.push(records.slice(i, i + chunkSize));
  }

  const results: Array<Record<T>> = [];

  for (const chunk of chunks) {
    const created = await base(tableName).create(
      chunk.map(fields => ({ fields }))
    );
    results.push(...created);
  }

  return results;
}

/**
 * Convert Airtable record to Partner type
 */
export function recordToPartner(record: Record<FieldSet>): Partner {
  const f = record.fields;
  return {
    id: record.id,
    Name: (f.Name as string) || "",
    Category: (f.Category as Partner["Category"]) || "Other",
    "Sub Category": f["Sub Category"] as string,
    "Surface Type": (f["Surface Type"] as Partner["Surface Type"]) || "Other",
    Stage: (f.Stage as Partner["Stage"]) || "Prospecting",
    Priority: (f.Priority as Partner["Priority"]) || "Low",
    Likelihood: (f.Likelihood as Partner["Likelihood"]) || "Low",
    Owner: (f.Owner as Partner["Owner"]) || "Langdon Miller",
    Description: f.Description as string,
    "Partnership Hypothesis": f["Partnership Hypothesis"] as string,
    "Status Details & Action Items": f["Status Details & Action Items"] as string,
    Timeline: f.Timeline as string,
    "Current Monetization": f["Current Monetization"] as string,
    "Approved Formats": f["Approved Formats"] as string,
    Scale: f.Scale as string,
    Materials: f.Materials as string,
    Pricing: f.Pricing as string,
    Targeting: f.Targeting as string,
    "Contract Status": (f["Contract Status"] as Partner["Contract Status"]) || "None",
    "Integration Method": f["Integration Method"] as string,
    Intermediary: f.Intermediary as string,
    "New Contract Point": f["New Contract Point"] as string,
    "Spend Point": f["Spend Point"] as string,
    "Company Research": f["Company Research"] as string,
    Website: f.Website as string,
    Stalled: !!f.Stalled,
    "Last Activity Date": f["Last Activity Date"] as string,
    Contacts: f.Contacts as string[],
  };
}

/**
 * Convert Airtable record to Contact type
 */
export function recordToContact(record: Record<FieldSet>): Contact {
  const f = record.fields;
  return {
    id: record.id,
    Name: (f.Name as string) || "",
    Partner: f.Partner as string[],
    Title: f.Title as string,
    Email: f.Email as string,
    LinkedIn: f.LinkedIn as string,
    Phone: f.Phone as string,
    "Is Primary": !!f["Is Primary"],
    Notes: f.Notes as string,
    "Last Contacted": f["Last Contacted"] as string,
  };
}

/**
 * Convert Airtable record to OutreachLog type
 */
export function recordToOutreachLog(record: Record<FieldSet>): OutreachLog {
  const f = record.fields;
  return {
    id: record.id,
    Contact: f.Contact as string[],
    Partner: f.Partner as string[],
    Channel: (f.Channel as OutreachLog["Channel"]) || "Email",
    Direction: (f.Direction as OutreachLog["Direction"]) || "Outbound",
    Subject: f.Subject as string,
    Body: f.Body as string,
    Status: (f.Status as OutreachLog["Status"]) || "Sent",
    "Sent At": (f["Sent At"] as string) || new Date().toISOString(),
    "Follow-up Due": f["Follow-up Due"] as string,
    "Follow-up Completed": !!f["Follow-up Completed"],
    "Gmail Message ID": f["Gmail Message ID"] as string,
  };
}

/**
 * Convert Airtable record to Ticket type
 */
export function recordToTicket(record: Record<FieldSet>): Ticket {
  const f = record.fields;
  return {
    id: record.id,
    Title: (f.Title as string) || "",
    Partner: f.Partner as string[],
    Description: f.Description as string,
    "Assigned To": (f["Assigned To"] as Ticket["Assigned To"]) || "Langdon",
    Priority: (f.Priority as Ticket["Priority"]) || "Medium",
    Status: (f.Status as Ticket["Status"]) || "Open",
    "Due Date": f["Due Date"] as string,
    "Created By": f["Created By"] as string,
  };
}

/**
 * Convert Airtable record to TimelineEvent type
 */
export function recordToTimelineEvent(record: Record<FieldSet>): TimelineEvent {
  const f = record.fields;
  return {
    id: record.id,
    Partner: f.Partner as string[],
    "Event Type": (f["Event Type"] as TimelineEvent["Event Type"]) || "Note",
    Description: (f.Description as string) || "",
    "Created By": f["Created By"] as string,
    Timestamp: (f.Timestamp as string) || new Date().toISOString(),
  };
}

/**
 * Helper to create a timeline event when something happens
 */
export async function createTimelineEvent(
  partnerId: string,
  eventType: TimelineEvent["Event Type"],
  description: string,
  createdBy?: string
): Promise<void> {
  await createRecord(TABLES.TIMELINE_EVENTS, {
    Partner: [partnerId],
    "Event Type": eventType,
    Description: description,
    "Created By": createdBy || "System",
    Timestamp: new Date().toISOString(),
  });
}

/**
 * Helper to update partner's last activity date
 */
export async function updatePartnerActivity(partnerId: string): Promise<void> {
  await updateRecord(TABLES.PARTNERS, partnerId, {
    "Last Activity Date": new Date().toISOString().split("T")[0],
    Stalled: false,
  });
}

/**
 * Check for stalled partners (no activity in 14 days)
 */
export async function checkStalledPartners(): Promise<void> {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const cutoffDate = fourteenDaysAgo.toISOString().split("T")[0];

  const partners = await listRecords(TABLES.PARTNERS, {
    filterByFormula: `AND(
      OR(
        {Last Activity Date} = '',
        {Last Activity Date} < '${cutoffDate}'
      ),
      NOT(OR(
        {Stage} = 'Live',
        {Stage} = 'Paused',
        {Stage} = 'Dead',
        {Stage} = 'Not Interested'
      ))
    )`,
  });

  for (const partner of partners) {
    await updateRecord(TABLES.PARTNERS, partner.id, {
      Stalled: true,
    });
  }
}