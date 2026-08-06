export interface EmergencyContactInput {
  name: string;
  nickname?: string | null;
  relationship?: string | null;
  company?: string | null;
  category?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  telegramUsername?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  avatar?: string | null;
  notes?: string | null;
  priority?: "HIGH" | "MEDIUM" | "LOW" | string | null;
  favorite?: boolean | null;
  available24Hours?: boolean | null;
  country?: string | null;
  colorLabel?: string | null;
  birthday?: string | null;
}

/**
 * Exports contacts into vCard (.vcf) format.
 */
export function generateVCardString(contacts: EmergencyContactInput[]): string {
  return contacts
    .map((c) => {
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${c.name}`,
        c.nickname ? `NICKNAME:${c.nickname}` : null,
        c.company ? `ORG:${c.company}` : null,
        c.relationship ? `TITLE:${c.relationship}` : null,
        c.phoneNumber ? `TEL;TYPE=CELL:${c.phoneNumber}` : null,
        c.whatsappNumber ? `TEL;TYPE=WORK,VOICE:${c.whatsappNumber}` : null,
        c.email ? `EMAIL:${c.email}` : null,
        c.website ? `URL:${c.website}` : null,
        c.address ? `ADR;TYPE=HOME:;;${c.address};;;;` : null,
        c.notes ? `NOTE:${c.notes.replace(/\n/g, "\\n")}` : null,
        c.category ? `CATEGORIES:${c.category}` : null,
        "END:VCARD",
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n\n");
}

/**
 * Parses vCard (.vcf) content into contact objects.
 */
export function parseVCardString(vcfContent: string): EmergencyContactInput[] {
  const vcards = vcfContent.split(/END:VCARD/i).filter((s) => s.includes("BEGIN:VCARD"));
  const contacts: EmergencyContactInput[] = [];

  for (const vcard of vcards) {
    const getField = (field: string) => {
      const match = vcard.match(new RegExp(`^${field}[;:?]?.*?:(.*)$`, "im"));
      return match ? match[1].trim() : undefined;
    };

    const name = getField("FN") || getField("N")?.replace(/;/g, " ") || "Unnamed Contact";
    const phoneNumber = getField("TEL");
    const email = getField("EMAIL");
    const company = getField("ORG");
    const relationship = getField("TITLE");
    const website = getField("URL");
    const notes = getField("NOTE")?.replace(/\\n/g, "\n");
    const category = getField("CATEGORIES") || "Other";

    contacts.push({
      name,
      phoneNumber,
      email,
      company,
      relationship,
      website,
      notes,
      category,
      priority: "MEDIUM",
    });
  }

  return contacts;
}

/**
 * Exports contacts into CSV format.
 */
export function generateCSVString(contacts: EmergencyContactInput[]): string {
  const headers = [
    "Name",
    "Nickname",
    "Relationship",
    "Company",
    "Category",
    "Phone Number",
    "WhatsApp Number",
    "Email",
    "Website",
    "Address",
    "Priority",
    "24/7 Available",
    "Favorite",
    "Notes",
  ];

  const rows = contacts.map((c) => [
    `"${(c.name || "").replace(/"/g, '""')}"`,
    `"${(c.nickname || "").replace(/"/g, '""')}"`,
    `"${(c.relationship || "").replace(/"/g, '""')}"`,
    `"${(c.company || "").replace(/"/g, '""')}"`,
    `"${(c.category || "Other").replace(/"/g, '""')}"`,
    `"${(c.phoneNumber || "").replace(/"/g, '""')}"`,
    `"${(c.whatsappNumber || "").replace(/"/g, '""')}"`,
    `"${(c.email || "").replace(/"/g, '""')}"`,
    `"${(c.website || "").replace(/"/g, '""')}"`,
    `"${(c.address || "").replace(/"/g, '""')}"`,
    `"${c.priority || "MEDIUM"}"`,
    `"${c.available24Hours ? "Yes" : "No"}"`,
    `"${c.favorite ? "Yes" : "No"}"`,
    `"${(c.notes || "").replace(/"/g, '""')}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Triggers file download in browser.
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
