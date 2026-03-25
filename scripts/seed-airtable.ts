#!/usr/bin/env tsx
/**
 * Airtable Seed Script - Master Pipe v2
 *
 * This script creates the Airtable schema and populates it with initial data.
 * Run with: npm run seed-airtable
 *
 * IMPORTANT: This will create new tables in your Airtable base.
 * Make sure AIRTABLE_API_KEY and AIRTABLE_BASE_ID are set in .env.local
 */

import * as dotenv from "dotenv";
import path from "path";
import Airtable from "airtable";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  console.error("❌ Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in .env.local");
  process.exit(1);
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

// Seed data for Partners table
const PARTNERS_SEED = [
  // Active/Integrating
  {
    Name: "Nimbus",
    Category: "App",
    "Surface Type": "In-App",
    Stage: "Integrating",
    Priority: "High",
    Likelihood: "High",
    Owner: "Langdon Miller",
    Description: "Weather app with location-based inventory",
    "Partnership Hypothesis": "High-value location-based audiences for automotive and retail brands",
    "Status Details & Action Items": "Tech integration in progress, testing ad serving",
    Timeline: "Q1 2024",
    "Current Monetization": "GAM, Prebid",
    Scale: "50M MAU",
    "Contract Status": "MSA Signed",
    "Integration Method": "Prebid Server",
    Website: "https://nimbus.com"
  },
  {
    Name: "Sallie",
    Category: "App",
    "Surface Type": "In-App",
    Stage: "Integrating",
    Priority: "High",
    Likelihood: "High",
    Owner: "Ben Balbona",
    Description: "Personal finance app",
    "Partnership Hypothesis": "Financial services and education advertisers",
    "Status Details & Action Items": "Finalizing technical requirements",
    Timeline: "Q1 2024",
    "Current Monetization": "Direct sold only",
    Scale: "10M MAU",
    "Contract Status": "MSA Signed",
    Website: "https://sallie.com"
  },
  {
    Name: "Washington Post",
    Category: "RMN Onsite",
    "Surface Type": "Web",
    Stage: "Meeting Booked",
    Priority: "High",
    Likelihood: "Med",
    Owner: "Langdon Miller",
    Description: "Major news publisher retail media network",
    "Partnership Hypothesis": "Premium news inventory for brand advertisers",
    "Status Details & Action Items": "Meeting scheduled for next week to discuss integration",
    Timeline: "Q2 2024",
    "Current Monetization": "GAM, Amazon TAM",
    Scale: "100M+ monthly uniques",
    "Contract Status": "NDA Signed",
    Website: "https://washingtonpost.com"
  },
  {
    Name: "HP",
    Category: "Other",
    "Surface Type": "Other",
    Stage: "Live",
    Priority: "High",
    Likelihood: "High",
    Owner: "Langdon Miller",
    Description: "Hardware manufacturer screens",
    "Partnership Hypothesis": "Unique hardware-based ad inventory",
    "Status Details & Action Items": "Live and scaling",
    Timeline: "Live",
    "Current Monetization": "Direct integration",
    Scale: "Millions of devices",
    "Contract Status": "MSA Signed",
    "Integration Method": "Direct API",
    Website: "https://hp.com"
  },
  {
    Name: "VSCO",
    Category: "App",
    "Surface Type": "In-App",
    Stage: "Live - Crawl",
    Priority: "Med",
    Likelihood: "High",
    Owner: "Ben Balbona",
    Description: "Photo editing and sharing app",
    "Partnership Hypothesis": "Creative community for lifestyle and fashion brands",
    "Status Details & Action Items": "In crawl phase, monitoring performance",
    Timeline: "Live",
    "Current Monetization": "MoPub, AdMob",
    Scale: "20M MAU",
    "Contract Status": "MSA Signed",
    "Integration Method": "SDK",
    Website: "https://vsco.co"
  },
  // Negotiating
  {
    Name: "Kevel",
    Category: "Other",
    "Surface Type": "Other",
    Stage: "Negotiating",
    Priority: "High",
    Likelihood: "High",
    Owner: "Langdon Miller",
    Description: "Ad server infrastructure provider",
    "Partnership Hypothesis": "Access to multiple publisher partners through single integration",
    "Status Details & Action Items": "Contract negotiations in progress",
    Timeline: "Q1 2024",
    "Current Monetization": "N/A - Infrastructure",
    Scale: "Powers 100+ publishers",
    "Contract Status": "MSA Drafting",
    "Integration Method": "Server-to-server",
    Intermediary: "Direct",
    Website: "https://kevel.com"
  },
  {
    Name: "Vistar",
    Category: "DOOH",
    "Surface Type": "DOOH",
    Stage: "Negotiating",
    Priority: "High",
    Likelihood: "High",
    Owner: "Langdon Miller",
    Description: "Digital out-of-home SSP",
    "Partnership Hypothesis": "Access to premium DOOH screens nationwide",
    "Status Details & Action Items": "Working through commercial terms with Oran",
    Timeline: "Q1 2024",
    "Current Monetization": "Programmatic DOOH",
    Scale: "100K+ screens",
    "Contract Status": "MSA Redline",
    "Integration Method": "OpenRTB",
    Intermediary: "Vistar SSP",
    Website: "https://vistar.com"
  },
  // Meeting Booked/In Progress
  {
    Name: "Apple News",
    Category: "App",
    "Surface Type": "In-App",
    Stage: "Meeting Booked",
    Priority: "High",
    Likelihood: "Med",
    Owner: "Langdon Miller",
    Description: "Premium news aggregation app",
    "Partnership Hypothesis": "High-value iOS audience for premium brands",
    "Status Details & Action Items": "Meeting with Kelly next week",
    Timeline: "Q2 2024",
    "Current Monetization": "Closed ecosystem",
    Scale: "125M MAU",
    "Contract Status": "None",
    Website: "https://apple.com/apple-news"
  },
  {
    Name: "Clear Channel",
    Category: "DOOH",
    "Surface Type": "DOOH",
    Stage: "Meeting Booked",
    Priority: "High",
    Likelihood: "Med",
    Owner: "Ben Balbona",
    Description: "Largest outdoor advertising company",
    "Partnership Hypothesis": "Premium billboard and airport inventory",
    "Status Details & Action Items": "Follow-up meeting with Wade Rifkin scheduled",
    Timeline: "Q2 2024",
    "Current Monetization": "Direct and programmatic",
    Scale: "500K+ displays",
    "Contract Status": "NDA Sent",
    "Integration Method": "TBD",
    Intermediary: "Potentially Vistar",
    Website: "https://clearchannel.com"
  },
  {
    Name: "United Airlines",
    Category: "Travel Media",
    "Surface Type": "In-App",
    Stage: "Meeting Booked",
    Priority: "High",
    Likelihood: "Med",
    Owner: "Jack",
    Description: "Major airline in-flight entertainment",
    "Partnership Hypothesis": "Captive premium audience during flights",
    "Status Details & Action Items": "Initial call scheduled",
    Timeline: "Q2 2024",
    "Current Monetization": "Direct sold",
    Scale: "100M+ passengers/year",
    "Contract Status": "None",
    Website: "https://united.com"
  },
  {
    Name: "Delta Airlines",
    Category: "Travel Media",
    "Surface Type": "In-App",
    Stage: "Prospecting",
    Priority: "High",
    Likelihood: "Med",
    Owner: "Jack",
    Description: "Major airline in-flight entertainment and app",
    "Partnership Hypothesis": "Premium travel audience",
    "Status Details & Action Items": "Researching contacts",
    Timeline: "Q2 2024",
    "Current Monetization": "Unknown",
    Scale: "120M+ passengers/year",
    "Contract Status": "None",
    Website: "https://delta.com"
  },
  // Prospecting
  {
    Name: "Walmart",
    Category: "RMN Onsite",
    "Surface Type": "Web",
    Stage: "Prospecting",
    Priority: "High",
    Likelihood: "Low",
    Owner: "Adrienne Ross",
    Description: "Largest retailer's media network",
    "Partnership Hypothesis": "Massive scale retail media inventory",
    "Status Details & Action Items": "Identifying right contacts",
    Timeline: "Q3 2024",
    "Current Monetization": "Walmart Connect",
    Scale: "150M+ monthly visitors",
    "Contract Status": "None",
    Website: "https://walmart.com"
  },
  {
    Name: "Venmo",
    Category: "App",
    "Surface Type": "In-App",
    Stage: "Prospecting",
    Priority: "Med",
    Likelihood: "Low",
    Owner: "Ben Balbona",
    Description: "Payment app with social feed",
    "Partnership Hypothesis": "Engaged millennial/Gen Z audience",
    "Status Details & Action Items": "Initial research phase",
    Timeline: "Q3 2024",
    "Current Monetization": "Unknown",
    Scale: "90M+ users",
    "Contract Status": "None",
    Website: "https://venmo.com"
  },
  {
    Name: "NY Times",
    Category: "RMN Onsite",
    "Surface Type": "Web",
    Stage: "Prospecting",
    Priority: "High",
    Likelihood: "Med",
    Owner: "Langdon Miller",
    Description: "Premium news publisher",
    "Partnership Hypothesis": "High-value educated audience",
    "Status Details & Action Items": "Researching decision makers",
    Timeline: "Q2 2024",
    "Current Monetization": "GAM, Direct",
    Scale: "100M+ monthly uniques",
    "Contract Status": "None",
    Website: "https://nytimes.com"
  },
  {
    Name: "SoundCloud",
    Category: "App",
    "Surface Type": "In-App",
    Stage: "Prospecting",
    Priority: "Med",
    Likelihood: "Med",
    Owner: "Jack",
    Description: "Music streaming platform",
    "Partnership Hypothesis": "Music enthusiast audience",
    "Status Details & Action Items": "Justin from Aditude has connections",
    Timeline: "Q2 2024",
    "Current Monetization": "Audio ads",
    Scale: "30M+ MAU",
    "Contract Status": "None",
    Website: "https://soundcloud.com"
  },
  {
    Name: "WiConnect",
    Category: "WiFi Portal",
    "Surface Type": "WiFi Portal",
    Stage: "Prospecting",
    Priority: "High",
    Likelihood: "High",
    Owner: "Langdon Miller",
    Description: "WiFi portal provider for venues",
    "Partnership Hypothesis": "Captive portal inventory in high-traffic venues",
    "Status Details & Action Items": "Multiple contacts identified",
    Timeline: "Q1 2024",
    "Current Monetization": "Direct",
    Scale: "Thousands of venues",
    "Contract Status": "None",
    Website: "https://wiconnect.com"
  },
  {
    Name: "Boingo",
    Category: "WiFi Portal",
    "Surface Type": "WiFi Portal",
    Stage: "Prospecting",
    Priority: "Med",
    Likelihood: "Med",
    Owner: "Langdon Miller",
    Description: "Airport and venue WiFi provider",
    "Partnership Hypothesis": "Travel and business audience",
    "Status Details & Action Items": "Researching contacts",
    Timeline: "Q2 2024",
    "Current Monetization": "Captive portal ads",
    Scale: "1M+ daily users",
    "Contract Status": "None",
    Website: "https://boingo.com"
  },
  {
    Name: "Purple",
    Category: "WiFi Portal",
    "Surface Type": "WiFi Portal",
    Stage: "Prospecting",
    Priority: "Med",
    Likelihood: "Med",
    Owner: "Ben Balbona",
    Description: "Guest WiFi and analytics platform",
    "Partnership Hypothesis": "Retail and hospitality venue inventory",
    "Status Details & Action Items": "Gavin Wheeldon is contact",
    Timeline: "Q2 2024",
    "Current Monetization": "Splash pages",
    Scale: "100M+ users globally",
    "Contract Status": "None",
    Website: "https://purple.ai"
  }
];

// Seed data for Contacts table
const CONTACTS_SEED = [
  // WiConnect contacts
  {
    Name: "Jeffrey Schoenfeld",
    Partner: "WiConnect",
    Title: "CEO",
    Email: "jeffrey@wiconnect.com",
    LinkedIn: "https://linkedin.com/in/jeffreyschoenfeld",
    "Is Primary": true
  },
  {
    Name: "Ryan McLoughlin",
    Partner: "WiConnect",
    Title: "VP Sales",
    Email: "ryan@wiconnect.com",
    LinkedIn: "https://linkedin.com/in/ryanmcloughlin"
  },
  {
    Name: "Mark Bahle",
    Partner: "WiConnect",
    Title: "CTO",
    Email: "mark@wiconnect.com",
    LinkedIn: "https://linkedin.com/in/markbahle"
  },
  {
    Name: "Brian Jacks",
    Partner: "WiConnect",
    Title: "VP Business Development",
    Email: "brian@wiconnect.com",
    LinkedIn: "https://linkedin.com/in/brianjacks"
  },
  // Other contacts
  {
    Name: "Chris Norton",
    Partner: "Marriott",
    Title: "VP Digital",
    LinkedIn: "https://linkedin.com/in/chrisnorton",
    "Is Primary": true
  },
  {
    Name: "Benjamin Matlin",
    Partner: "Adentro",
    Title: "CEO",
    Email: "ben@adentro.com",
    LinkedIn: "https://linkedin.com/in/benjaminmatlin",
    "Is Primary": true
  },
  {
    Name: "Nat Brogadir",
    Partner: "Adentro",
    Title: "VP Sales",
    LinkedIn: "https://linkedin.com/in/natbrogadir"
  },
  {
    Name: "Rob Mitchell-Crossley",
    Partner: "Adentro",
    Title: "VP Engineering",
    LinkedIn: "https://linkedin.com/in/robmitchellcrossley"
  },
  {
    Name: "Gavin Wheeldon",
    Partner: "Purple",
    Title: "CEO",
    Email: "gavin@purple.ai",
    LinkedIn: "https://linkedin.com/in/gavinwheeldon",
    "Is Primary": true
  },
  {
    Name: "Oran Cummins",
    Partner: "Vistar",
    Title: "VP Partnerships",
    Email: "oran@vistar.com",
    LinkedIn: "https://linkedin.com/in/orancummins",
    "Is Primary": true,
    Notes: "Main point of contact for DOOH integration"
  },
  {
    Name: "Wade Rifkin",
    Partner: "Clear Channel",
    Title: "SVP Digital",
    LinkedIn: "https://linkedin.com/in/waderifkin",
    "Is Primary": true,
    Notes: "Decision maker for programmatic partnerships"
  },
  {
    Name: "Kelly Chen",
    Partner: "Apple News",
    Title: "Partnerships Lead",
    LinkedIn: "https://linkedin.com/in/kellychen",
    "Is Primary": true,
    Notes: "Meeting scheduled for next week"
  },
  {
    Name: "Justin Park",
    Partner: "SoundCloud",
    Title: "VP Monetization",
    LinkedIn: "https://linkedin.com/in/justinpark",
    Notes: "Connection via Aditude"
  }
];

async function seedAirtable() {
  console.log("🌱 Starting Airtable seed...\n");

  try {
    // Note: Airtable doesn't have a direct API to create tables
    // Tables need to be created manually in the Airtable UI first
    // This script will populate existing tables

    console.log("📝 Important: Make sure these tables exist in your Airtable base:");
    console.log("   - Partners");
    console.log("   - Contacts");
    console.log("   - Outreach Log");
    console.log("   - Tickets");
    console.log("   - Timeline Events\n");

    console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Create Partners
    console.log("\n🏢 Creating Partners...");
    const partnersTable = base("Partners");

    // Create partners in batches of 10 (Airtable limit)
    const partnerBatches = [];
    for (let i = 0; i < PARTNERS_SEED.length; i += 10) {
      partnerBatches.push(PARTNERS_SEED.slice(i, i + 10));
    }

    const createdPartners: any[] = [];
    for (const batch of partnerBatches) {
      const records = await partnersTable.create(
        batch.map(fields => ({ fields }))
      );
      createdPartners.push(...records);
      console.log(`   ✓ Created ${records.length} partners`);
    }

    // Create a map of partner names to IDs for contacts
    const partnerMap = new Map(
      createdPartners.map(p => [p.fields.Name, p.id])
    );

    // Create Contacts
    console.log("\n👥 Creating Contacts...");
    const contactsTable = base("Contacts");

    // Update contact records with partner IDs
    const contactsWithPartnerIds = CONTACTS_SEED.map(contact => {
      const partnerName = contact.Partner;
      const partnerId = partnerMap.get(partnerName);

      if (!partnerId && partnerName) {
        console.log(`   ⚠️  Partner "${partnerName}" not found for contact ${contact.Name}`);
      }

      return {
        ...contact,
        Partner: partnerId ? [partnerId] : undefined
      };
    });

    // Create contacts in batches
    const contactBatches = [];
    for (let i = 0; i < contactsWithPartnerIds.length; i += 10) {
      contactBatches.push(contactsWithPartnerIds.slice(i, i + 10));
    }

    for (const batch of contactBatches) {
      const records = await contactsTable.create(
        batch.map(fields => ({ fields }))
      );
      console.log(`   ✓ Created ${records.length} contacts`);
    }

    // Create sample Timeline Events for some partners
    console.log("\n📅 Creating Timeline Events...");
    const timelineTable = base("Timeline Events");

    const sampleEvents = [
      {
        Partner: [partnerMap.get("Nimbus")],
        "Event Type": "Stage Change",
        Description: "Stage changed from Negotiating to Integrating",
        "Created By": "Langdon Miller",
        Timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        Partner: [partnerMap.get("Washington Post")],
        "Event Type": "Meeting",
        Description: "Initial partnership discussion with digital team",
        "Created By": "Langdon Miller",
        Timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        Partner: [partnerMap.get("Vistar")],
        "Event Type": "Contract Update",
        Description: "MSA sent for review",
        "Created By": "Ben Balbona",
        Timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ].filter(e => e.Partner[0]); // Only include events where partner was found

    if (sampleEvents.length > 0) {
      await timelineTable.create(
        sampleEvents.map(fields => ({ fields }))
      );
      console.log(`   ✓ Created ${sampleEvents.length} timeline events`);
    }

    console.log("\n✅ Seed completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${PARTNERS_SEED.length} partners created`);
    console.log(`   - ${CONTACTS_SEED.length} contacts created`);
    console.log(`   - ${sampleEvents.length} timeline events created`);

    console.log("\n🎉 Your Airtable base is now populated with seed data!");
    console.log("   You can now run the app with: npm run dev");

  } catch (error) {
    console.error("\n❌ Error seeding Airtable:", error);
    if ((error as any).statusCode === 404) {
      console.error("\n📝 Make sure the table names match exactly in your Airtable base:");
      console.error("   - Partners");
      console.error("   - Contacts");
      console.error("   - Outreach Log");
      console.error("   - Tickets");
      console.error("   - Timeline Events");
    }
    process.exit(1);
  }
}

// Run the seed script
seedAirtable().catch(console.error);