"use client";

import { useState, useEffect, useCallback } from "react";

type Contact = {
  id: string;
  Name: string;
  Company: string;
  Title: string;
  Email: string;
  LinkedIn: string;
  Cateogry: string;
  Stage: string;
  "LinkedIn Friended": boolean;
  "Follow-Up Enabled": boolean;
  "Last Contacted": string;
  "Follow-Up Count": number;
  "Last Follow-Up Date": string;
  "Company Intel": string;
  Notes: string;
};

type ResearchRequest = {
  id: string;
  Company: string;
  Context: string;
  Status: string;
  "Results Count": number;
  "Company Intel": string;
  Created: string;
};

const STAGES = [
  "New",
  "Enriching",
  "Outreach Ready",
  "Sent",
  "Following Up",
  "Replied",
] as const;

const STAGE_COLORS: Record<string, string> = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Enriching: "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Outreach Ready": "bg-orange-50 text-orange-700 border-orange-200",
  Sent: "bg-purple-50 text-purple-700 border-purple-200",
  "Following Up": "bg-cyan-50 text-cyan-700 border-cyan-200",
  Replied: "bg-green-50 text-green-700 border-green-200",
};

const STAGE_DOT: Record<string, string> = {
  New: "bg-blue-500",
  Enriching: "bg-yellow-500",
  "Outreach Ready": "bg-orange-500",
  Sent: "bg-purple-500",
  "Following Up": "bg-cyan-500",
  Replied: "bg-green-500",
};

const RESEARCH_STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Researching: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Done: "bg-green-50 text-green-700 border-green-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
};

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [enriching, setEnriching] = useState<Set<string>>(new Set());
  const [drafting, setDrafting] = useState<Set<string>>(new Set());
  const [draftPreview, setDraftPreview] = useState<{
    contact: Contact;
    draft: { to: string; subject: string; body: string };
    gmailDraftId?: string | null;
    gmailConnected?: boolean;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "table" | "research">("kanban");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [researchRequests, setResearchRequests] = useState<ResearchRequest[]>([]);
  const [researchContacts, setResearchContacts] = useState<Record<string, Contact[]>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDrafting, setBulkDrafting] = useState(false);

  const fetchContacts = useCallback(async () => {
    const res = await fetch("/api/contacts");
    const data = await res.json();
    setContacts(data);
    setLoading(false);
  }, []);

  const fetchResearch = useCallback(async () => {
    const res = await fetch("/api/research");
    const data = await res.json();
    setResearchRequests(data.requests || []);
    setResearchContacts(data.contactsByCompany || {});
  }, []);

  useEffect(() => {
    fetchContacts();
    fetchResearch();
    // Check Gmail connection status
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => setGmailConnected(d.connected))
      .catch(() => {});
  }, [fetchContacts]);

  const addContact = async (form: {
    Name: string;
    Company: string;
    Title: string;
    LinkedIn: string;
    Cateogry: string;
    Notes: string;
  }) => {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const contact = await res.json();
    setContacts((prev) => [...prev, contact]);
    setShowAddForm(false);
  };

  const updateContact = async (id: string, fields: Partial<Contact>) => {
    const res = await fetch("/api/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...fields }),
    });
    const updated = await res.json();
    setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
    if (selectedContact?.id === id) setSelectedContact(updated);
  };

  const enrichContact = async (contact: Contact) => {
    setEnriching((prev) => new Set(prev).add(contact.id));
    const res = await fetch("/api/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactId: contact.id,
        name: contact.Name,
        company: contact.Company,
        linkedinUrl: contact.LinkedIn,
      }),
    });
    const data = await res.json();
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? data.contact : c))
    );
    setEnriching((prev) => {
      const next = new Set(prev);
      next.delete(contact.id);
      return next;
    });
  };

  const createDraft = async (contact: Contact) => {
    await createBulkDrafts([contact]);
  };

  const createBulkDrafts = async (contactList: Contact[]) => {
    const eligible = contactList.filter((c) => c.Email);
    if (eligible.length === 0) return;

    setBulkDrafting(true);
    for (const c of eligible) {
      setDrafting((prev) => new Set(prev).add(c.id));
    }

    const res = await fetch("/api/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contacts: eligible.map((c) => ({
          contactId: c.id,
          email: c.Email,
          name: c.Name,
          company: c.Company,
          title: c.Title,
          category: c.Cateogry,
          companyIntel: c["Company Intel"],
        })),
      }),
    });
    const data = await res.json();

    if (data.results) {
      setContacts((prev) => {
        const updated = [...prev];
        for (const r of data.results) {
          if (r.contact) {
            const idx = updated.findIndex((c) => c.id === r.contact.id);
            if (idx >= 0) updated[idx] = r.contact;
          }
        }
        return updated;
      });

      // Show preview of first draft
      const firstResult = data.results.find((r: any) => r.draft);
      if (firstResult) {
        setDraftPreview({
          contact: firstResult.contact,
          draft: firstResult.draft,
          gmailDraftId: firstResult.gmailDraftId,
          gmailConnected: firstResult.gmailConnected,
        });
      }
    }

    setDrafting(new Set());
    setSelected(new Set());
    setBulkDrafting(false);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllNew = () => {
    const newWithEmail = contacts.filter(
      (c) => (c.Stage || "New") === "New" && c.Email
    );
    setSelected(new Set(newWithEmail.map((c) => c.id)));
  };

  const grouped = STAGES.reduce(
    (acc, stage) => {
      acc[stage] = contacts.filter((c) => (c.Stage || "New") === stage);
      return acc;
    },
    {} as Record<string, Contact[]>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted text-lg">Loading pipeline...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Master Pipe</h1>
          <p className="text-sm text-muted">Outreach Pipeline Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          {gmailConnected ? (
            <span className="text-xs text-green-600 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
              Gmail Connected (IMAP · draft-only)
            </span>
          ) : (
            <span className="text-xs text-warning bg-warning/10 border border-warning/20 px-2.5 py-1 rounded-full">
              Gmail Not Connected
            </span>
          )}
          <div className="flex bg-card rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                viewMode === "kanban"
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                viewMode === "table"
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("research")}
              className={`px-3 py-1.5 rounded-md text-sm transition ${
                viewMode === "research"
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Research
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Add Contact
          </button>
        </div>
      </header>

      {/* Metrics Bar */}
      <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-border">
        {STAGES.map((stage) => (
          <div key={stage} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${STAGE_DOT[stage]}`} />
            <span className="text-sm text-muted">{stage}</span>
            <span className="text-sm font-semibold ml-auto">
              {grouped[stage]?.length || 0}
            </span>
          </div>
        ))}
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-indigo-700">
              {selected.size} contact{selected.size > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-indigo-500 hover:text-indigo-700"
            >
              Clear
            </button>
            <button
              onClick={selectAllNew}
              className="text-xs text-indigo-500 hover:text-indigo-700"
            >
              Select all New with email
            </button>
          </div>
          <button
            onClick={() => {
              const selectedContacts = contacts.filter((c) => selected.has(c.id));
              createBulkDrafts(selectedContacts);
            }}
            disabled={bulkDrafting}
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {bulkDrafting ? "Creating Drafts..." : `Create ${selected.size} Draft${selected.size > 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "kanban" ? (
          <KanbanView
            grouped={grouped}
            enriching={enriching}
            drafting={drafting}
            onEnrich={enrichContact}
            onDraft={createDraft}
            onUpdate={updateContact}
            onSelect={setSelectedContact}
            selected={selected}
            onToggleSelect={toggleSelect}
          />
        ) : viewMode === "table" ? (
          <TableView
            contacts={contacts}
            enriching={enriching}
            drafting={drafting}
            onEnrich={enrichContact}
            onDraft={createDraft}
            selected={selected}
            onToggleSelect={toggleSelect}
            onUpdate={updateContact}
            onSelect={setSelectedContact}
          />
        ) : (
          <ResearchView
            requests={researchRequests}
            contactsByCompany={researchContacts}
            onSubmit={async (company, context) => {
              const res = await fetch("/api/research", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ company, context }),
              });
              const data = await res.json();
              setResearchRequests((prev) => [data, ...prev]);
            }}
            onRefresh={fetchResearch}
            onAddToPipeline={async (contact) => {
              const res = await fetch("/api/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contact),
              });
              const created = await res.json();
              setContacts((prev) => [...prev, created]);
            }}
          />
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddForm && (
        <AddContactModal
          onClose={() => setShowAddForm(false)}
          onAdd={addContact}
        />
      )}

      {/* Draft Preview Modal */}
      {draftPreview && (
        <DraftPreviewModal
          draft={draftPreview.draft}
          contact={draftPreview.contact}
          gmailDraftId={draftPreview.gmailDraftId}
          gmailConnected={draftPreview.gmailConnected}
          onClose={() => setDraftPreview(null)}
        />
      )}

      {/* Contact Detail Drawer */}
      {selectedContact && (
        <ContactDrawer
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onUpdate={updateContact}
          onEnrich={enrichContact}
          onDraft={createDraft}
          enriching={enriching.has(selectedContact.id)}
          drafting={drafting.has(selectedContact.id)}
        />
      )}
    </div>
  );
}

/* ── Kanban View ─────────────────────────────────── */

function KanbanView({
  grouped,
  enriching,
  drafting,
  onEnrich,
  onDraft,
  onUpdate,
  onSelect,
  selected,
  onToggleSelect,
}: {
  grouped: Record<string, Contact[]>;
  enriching: Set<string>;
  drafting: Set<string>;
  onEnrich: (c: Contact) => void;
  onDraft: (c: Contact) => void;
  onUpdate: (id: string, f: Partial<Contact>) => void;
  onSelect: (c: Contact) => void;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-4 p-6 overflow-x-auto h-full">
      {STAGES.map((stage) => (
        <div key={stage} className="flex-shrink-0 w-72 flex flex-col">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className={`w-2.5 h-2.5 rounded-full ${STAGE_DOT[stage]}`} />
            <h3 className="text-sm font-semibold">{stage}</h3>
            <span className="text-xs text-muted ml-auto bg-card px-2 py-0.5 rounded-full">
              {grouped[stage]?.length || 0}
            </span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {grouped[stage]?.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                enriching={enriching.has(contact.id)}
                drafting={drafting.has(contact.id)}
                onEnrich={() => onEnrich(contact)}
                onDraft={() => onDraft(contact)}
                onUpdate={onUpdate}
                onClick={() => onSelect(contact)}
                isSelected={selected.has(contact.id)}
                onToggleSelect={() => onToggleSelect(contact.id)}
                showSelect={stage === "New" && !!contact.Email}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Contact Card ────────────────────────────────── */

function ContactCard({
  contact,
  enriching,
  drafting,
  onEnrich,
  onDraft,
  onUpdate,
  onClick,
  isSelected,
  onToggleSelect,
  showSelect,
}: {
  contact: Contact;
  enriching: boolean;
  drafting: boolean;
  onEnrich: () => void;
  onDraft: () => void;
  onUpdate: (id: string, f: Partial<Contact>) => void;
  onClick: () => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  showSelect?: boolean;
}) {
  const stage = contact.Stage || "New";

  return (
    <div
      className={`bg-card border rounded-lg p-3 hover:bg-card-hover transition cursor-pointer group ${
        isSelected ? "border-accent ring-1 ring-accent" : "border-border"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0">
          {showSelect && (
            <input
              type="checkbox"
              checked={isSelected || false}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect?.();
              }}
              onClick={(e) => e.stopPropagation()}
              className="accent-indigo-600 flex-shrink-0"
            />
          )}
          <h4 className="text-sm font-medium truncate">{contact.Name}</h4>
        </div>
        {contact.LinkedIn && (
          <a
            href={contact.LinkedIn}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:text-blue-800 text-xs flex-shrink-0 ml-2"
          >
            LI
          </a>
        )}
      </div>
      <p className="text-xs text-muted truncate">
        {contact.Title}
        {contact.Title && contact.Company ? " · " : ""}
        {contact.Company}
      </p>
      {contact.Email && (
        <p className="text-xs text-muted mt-1 truncate">{contact.Email}</p>
      )}
      <div className="flex items-center gap-1.5 mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdate(contact.id, {
              "LinkedIn Friended": !contact["LinkedIn Friended"],
            });
          }}
          className={`text-xs px-1.5 py-0.5 rounded border transition ${
            contact["LinkedIn Friended"]
              ? "bg-green-50 text-green-700 border-green-200"
              : "text-muted border-border hover:border-muted"
          }`}
          title="LinkedIn Friended"
        >
          LI {contact["LinkedIn Friended"] ? "✓" : "○"}
        </button>

        {(stage === "Sent" || stage === "Following Up") && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(contact.id, {
                "Follow-Up Enabled": !contact["Follow-Up Enabled"],
              });
            }}
            className={`text-xs px-1.5 py-0.5 rounded border transition ${
              contact["Follow-Up Enabled"]
                ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                : "text-muted border-border hover:border-muted"
            }`}
            title="Follow-Up Enabled"
          >
            FU {contact["Follow-Up Enabled"] ? "✓" : "○"}
          </button>
        )}

        <div className="ml-auto flex gap-1">
          {stage === "New" && !contact.Email && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEnrich();
              }}
              disabled={enriching}
              className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-0.5 rounded transition disabled:opacity-50"
            >
              {enriching ? "..." : "Enrich"}
            </button>
          )}
          {(stage === "Outreach Ready" ||
            (stage === "New" && contact.Email)) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDraft();
              }}
              disabled={drafting}
              className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 px-2 py-0.5 rounded transition disabled:opacity-50"
            >
              {drafting ? "..." : "Draft"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Table View ──────────────────────────────────── */

function TableView({
  contacts,
  enriching,
  drafting,
  onEnrich,
  onDraft,
  onUpdate,
  onSelect,
  selected,
  onToggleSelect,
}: {
  contacts: Contact[];
  enriching: Set<string>;
  drafting: Set<string>;
  onEnrich: (c: Contact) => void;
  onDraft: (c: Contact) => void;
  onUpdate: (id: string, f: Partial<Contact>) => void;
  onSelect: (c: Contact) => void;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <div className="overflow-auto p-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted">
            <th className="pb-3 font-medium w-8"></th>
            <th className="pb-3 font-medium">Name</th>
            <th className="pb-3 font-medium">Company</th>
            <th className="pb-3 font-medium">Title</th>
            <th className="pb-3 font-medium">Email</th>
            <th className="pb-3 font-medium">Stage</th>
            <th className="pb-3 font-medium text-center">LI</th>
            <th className="pb-3 font-medium text-center">FU</th>
            <th className="pb-3 font-medium">Last Contact</th>
            <th className="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => {
            const stage = c.Stage || "New";
            return (
              <tr
                key={c.id}
                className="border-b border-border/50 hover:bg-card/50 cursor-pointer"
                onClick={() => onSelect(c)}
              >
                <td className="py-3">
                  {stage === "New" && c.Email && (
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => onToggleSelect(c.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="accent-indigo-600"
                    />
                  )}
                </td>
                <td className="py-3 font-medium">{c.Name}</td>
                <td className="py-3 text-muted">{c.Company}</td>
                <td className="py-3 text-muted">{c.Title}</td>
                <td className="py-3 text-muted">{c.Email || "—"}</td>
                <td className="py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${STAGE_COLORS[stage] || ""}`}
                  >
                    {stage}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(c.id, {
                        "LinkedIn Friended": !c["LinkedIn Friended"],
                      });
                    }}
                    className={`w-5 h-5 rounded border inline-flex items-center justify-center transition ${
                      c["LinkedIn Friended"]
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "border-border hover:border-muted"
                    }`}
                  >
                    {c["LinkedIn Friended"] ? "✓" : ""}
                  </button>
                </td>
                <td className="py-3 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate(c.id, {
                        "Follow-Up Enabled": !c["Follow-Up Enabled"],
                      });
                    }}
                    className={`w-5 h-5 rounded border inline-flex items-center justify-center transition ${
                      c["Follow-Up Enabled"]
                        ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                        : "border-border hover:border-muted"
                    }`}
                  >
                    {c["Follow-Up Enabled"] ? "✓" : ""}
                  </button>
                </td>
                <td className="py-3 text-muted">
                  {c["Last Contacted"] || "—"}
                </td>
                <td className="py-3">
                  <div className="flex gap-1">
                    {stage === "New" && !c.Email && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEnrich(c);
                        }}
                        disabled={enriching.has(c.id)}
                        className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-0.5 rounded transition disabled:opacity-50"
                      >
                        {enriching.has(c.id) ? "..." : "Enrich"}
                      </button>
                    )}
                    {(stage === "Outreach Ready" ||
                      (stage === "New" && c.Email)) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDraft(c);
                        }}
                        disabled={drafting.has(c.id)}
                        className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 px-2 py-0.5 rounded transition disabled:opacity-50"
                      >
                        {drafting.has(c.id) ? "..." : "Draft"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Research View ────────────────────────────────── */

function ResearchView({
  requests,
  contactsByCompany,
  onSubmit,
  onRefresh,
  onAddToPipeline,
}: {
  requests: ResearchRequest[];
  contactsByCompany: Record<string, Contact[]>;
  onSubmit: (company: string, context: string) => Promise<void>;
  onRefresh: () => void;
  onAddToPipeline: (contact: Partial<Contact>) => Promise<void>;
}) {
  const [company, setCompany] = useState("");
  const [context, setContext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!company.trim()) return;
    setSubmitting(true);
    await onSubmit(company.trim(), context.trim());
    setCompany("");
    setContext("");
    setSubmitting(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 overflow-y-auto h-full">
      {/* Research Input */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-3">Target a Company</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Company name (e.g., Walmart, Target, Nike)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
          <button
            onClick={handleSubmit}
            disabled={!company.trim() || submitting}
            className="bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 whitespace-nowrap"
          >
            {submitting ? "Adding..." : "Research"}
          </button>
        </div>
        <textarea
          placeholder="Optional context: e.g., 'Focus on their retail media network team' or 'They just launched a DTC brand'"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="w-full mt-2 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent h-16 resize-none"
        />
      </div>

      {/* Research Queue */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Research Queue</h3>
          <button
            onClick={onRefresh}
            className="text-xs text-muted hover:text-foreground transition"
          >
            Refresh
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted text-sm">
              No research requests yet. Enter a company above to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => {
              const foundContacts = contactsByCompany[req.Company] || [];
              const isExpanded = expandedCompany === req.Company;

              return (
                <div key={req.id}>
                  <div
                    className={`bg-card border border-border rounded-lg p-4 transition ${
                      req.Status === "Done" ? "cursor-pointer hover:bg-card-hover" : ""
                    }`}
                    onClick={() => {
                      if (req.Status === "Done") {
                        setExpandedCompany(isExpanded ? null : req.Company);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-medium">{req.Company}</h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            RESEARCH_STATUS_COLORS[req.Status] || ""
                          }`}
                        >
                          {req.Status}
                          {req.Status === "Pending" && (
                            <span className="ml-1 animate-pulse">...</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        {req.Status === "Done" && (
                          <span className="text-green-600">
                            {req["Results Count"] || foundContacts.length} contacts found
                          </span>
                        )}
                        {req.Created && <span>{req.Created}</span>}
                        {req.Status === "Done" && (
                          <span className="text-muted">{isExpanded ? "▲" : "▼"}</span>
                        )}
                      </div>
                    </div>
                    {req.Context && (
                      <p className="text-xs text-muted mt-1">{req.Context}</p>
                    )}
                  </div>

                  {/* Expanded Results */}
                  {isExpanded && foundContacts.length > 0 && (
                    <div className="ml-4 mt-2 space-y-1.5 mb-2">
                      {foundContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="bg-card/50 border border-border/50 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-sm font-medium">{contact.Name}</span>
                            <span className="text-xs text-muted ml-2">
                              {contact.Title}
                            </span>
                            {contact.Email && (
                              <span className="text-xs text-muted ml-2">
                                · {contact.Email}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {contact.LinkedIn && (
                              <a
                                href={contact.LinkedIn}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                LinkedIn
                              </a>
                            )}
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${
                                STAGE_COLORS[contact.Stage || "New"] || ""
                              }`}
                            >
                              {contact.Stage || "New"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isExpanded && foundContacts.length === 0 && req.Status === "Done" && (
                    <div className="ml-4 mt-2 mb-2 bg-card/50 border border-border/50 rounded-lg p-4 text-center">
                      <p className="text-xs text-muted">
                        Research complete but no contacts were added yet. The scheduled task may still be processing.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-card/50 border border-border/50 rounded-lg p-4">
        <p className="text-xs text-muted leading-relaxed">
          When you add a company, it enters the research queue. The scheduled task
          (running weekday mornings) will research decision-makers, find their
          LinkedIn profiles, enrich emails via Findymail, and add them to your
          pipeline. You can also trigger research manually from the Claude sidebar.
        </p>
      </div>
    </div>
  );
}

/* ── Add Contact Modal ───────────────────────────── */

function AddContactModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (f: any) => void;
}) {
  const [form, setForm] = useState({
    Name: "",
    Company: "",
    Title: "",
    LinkedIn: "",
    Cateogry: "",
    Notes: "",
  });

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Add Contact</h2>
        <div className="space-y-3">
          {(
            [
              ["Name", "Full name"],
              ["Company", "Company name"],
              ["Title", "Job title"],
              ["LinkedIn", "LinkedIn URL"],
              ["Cateogry", "Category"],
            ] as const
          ).map(([key, placeholder]) => (
            <input
              key={key}
              type="text"
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          ))}
          <textarea
            placeholder="Notes"
            value={form.Notes}
            onChange={(e) => setForm({ ...form, Notes: e.target.value })}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent h-20 resize-none"
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted hover:text-foreground transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onAdd(form)}
            disabled={!form.Name || !form.Company}
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            Add Contact
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Draft Preview Modal ─────────────────────────── */

function DraftPreviewModal({
  draft,
  contact,
  gmailDraftId,
  gmailConnected: isGmailConnected,
  onClose,
}: {
  draft: { to: string; subject: string; body: string };
  contact: Contact;
  gmailDraftId?: string | null;
  gmailConnected?: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-1">Draft Created</h2>
        <p className="text-sm text-muted mb-4">
          For {contact.Name} · {contact.Stage}
        </p>

        {gmailDraftId ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs text-green-600">
              Draft saved to Gmail — open Drafts to review, edit, and send yourself
            </span>
          </div>
        ) : !isGmailConnected ? (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 mb-3">
            <span className="text-xs text-yellow-400">
              Gmail not connected — set GMAIL_APP_PASSWORD in .env.local to enable auto-drafts
            </span>
          </div>
        ) : null}

        <div className="bg-background border border-border rounded-lg p-4 space-y-2">
          <div className="text-xs text-muted">
            <span className="font-medium">To:</span> {draft.to}
          </div>
          <div className="text-xs text-muted">
            <span className="font-medium">Subject:</span> {draft.subject}
          </div>
          <hr className="border-border" />
          <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
            {draft.body}
          </pre>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `To: ${draft.to}\nSubject: ${draft.subject}\n\n${draft.body}`
              );
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-4 py-2 text-sm text-muted hover:text-foreground border border-border rounded-lg transition"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={onClose}
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Contact Detail Drawer ───────────────────────── */

function ContactDrawer({
  contact,
  onClose,
  onUpdate,
  onEnrich,
  onDraft,
  enriching,
  drafting,
}: {
  contact: Contact;
  onClose: () => void;
  onUpdate: (id: string, f: Partial<Contact>) => void;
  onEnrich: (c: Contact) => void;
  onDraft: (c: Contact) => void;
  enriching: boolean;
  drafting: boolean;
}) {
  const [notes, setNotes] = useState(contact.Notes);
  const stage = contact.Stage || "New";

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} />
      <div className="w-96 bg-card border-l border-border h-full overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">{contact.Name}</h2>
            <p className="text-sm text-muted">
              {contact.Title}
              {contact.Title && contact.Company ? " · " : ""}
              {contact.Company}
            </p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground text-lg">
            x
          </button>
        </div>

        <div className="mb-4">
          <label className="text-xs text-muted block mb-1">Stage</label>
          <select
            value={stage}
            onChange={(e) => onUpdate(contact.id, { Stage: e.target.value })}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs text-muted block mb-1">Email</label>
            <p className="text-sm">{contact.Email || "Not found"}</p>
          </div>
          {contact.LinkedIn && (
            <div>
              <label className="text-xs text-muted block mb-1">LinkedIn</label>
              <a
                href={contact.LinkedIn}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {contact.LinkedIn}
              </a>
            </div>
          )}
          <div>
            <label className="text-xs text-muted block mb-1">Category</label>
            <p className="text-sm">{contact.Cateogry || "—"}</p>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Company Intel</label>
            <input
              type="text"
              value={contact["Company Intel"] || ""}
              onChange={(e) =>
                onUpdate(contact.id, { "Company Intel": e.target.value })
              }
              placeholder="e.g., Wi-Fi captive portals in hotels and airports"
              className="w-full bg-background border border-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Last Contacted</label>
            <p className="text-sm">{contact["Last Contacted"] || "Never"}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={contact["LinkedIn Friended"]}
              onChange={() =>
                onUpdate(contact.id, {
                  "LinkedIn Friended": !contact["LinkedIn Friended"],
                })
              }
              className="accent-green-500"
            />
            <span className="text-sm">LinkedIn Friended</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={contact["Follow-Up Enabled"]}
              onChange={() =>
                onUpdate(contact.id, {
                  "Follow-Up Enabled": !contact["Follow-Up Enabled"],
                })
              }
              className="accent-cyan-500"
            />
            <span className="text-sm">Follow-Up Enabled</span>
          </label>
        </div>

        <div className="mb-4">
          <label className="text-xs text-muted block mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => {
              if (notes !== contact.Notes) {
                onUpdate(contact.id, { Notes: notes });
              }
            }}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent h-24 resize-none"
          />
        </div>

        <div className="space-y-2">
          {stage === "New" && !contact.Email && (
            <button
              onClick={() => onEnrich(contact)}
              disabled={enriching}
              className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {enriching ? "Finding email..." : "Find Email (Findymail)"}
            </button>
          )}
          {(stage === "Outreach Ready" ||
            (stage === "New" && contact.Email)) && (
            <button
              onClick={() => onDraft(contact)}
              disabled={drafting}
              className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {drafting ? "Creating draft..." : "Create Outreach Draft"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
