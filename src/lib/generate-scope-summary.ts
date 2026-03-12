import { questions } from "@/lib/calculator-data";

/** Maps answer values back to human-readable scope bullet points */
export function generateScopeSummary(
  answers: Record<string, number>,
  selectedProducts: string[],
  attendeeHubSelected: boolean,
  attendeeHubFeatures: string[]
): string[] {
  const bullets: string[] = [];

  // Event length
  const len = answers["event_length"];
  if (len) bullets.push(len >= 4 ? "4+ day event" : `${len}-day event`);

  // Sessions
  const sess = answers["sessions"];
  if (sess === 1) bullets.push("Under 10 agenda sessions");
  else if (sess === 2) bullets.push("10–30 agenda sessions");
  else if (sess === 3) bullets.push("30+ agenda sessions");

  // Registration paths
  const reg = answers["reg_paths"];
  if (reg === 2) bullets.push("2–3 registration paths");
  else if (reg === 3) bullets.push("4+ registration paths");

  // Contact types
  const ct = answers["contact_types"];
  if (ct === 2) bullets.push("2–3 attendee/contact types");
  else if (ct === 3) bullets.push("4+ attendee/contact types");

  // Registration rules
  const rr = answers["reg_rules"];
  if (rr === 1) bullets.push("1–2 registration rules");
  else if (rr === 3) bullets.push("3+ registration rules");

  // Hotel
  if (answers["hotel"] && answers["hotel"] > 0) bullets.push("Hotel booking integration");

  // Languages
  if (answers["languages"] && answers["languages"] > 0) bullets.push("Multi-language support");

  // Integrations
  if (answers["integrations"] && answers["integrations"] > 0) bullets.push("CRM / marketing platform integration");

  // Speakers
  if (answers["speakers"] && answers["speakers"] > 0) bullets.push("Speaker management / abstract submission");

  // Appointments
  if (answers["appointments"] && answers["appointments"] > 0) bullets.push("Appointment scheduling");

  // Website pages
  const pg = answers["pages"];
  if (pg === 1) bullets.push("1–3 page event website");
  else if (pg === 2) bullets.push("4–7 page event website");
  else if (pg === 3) bullets.push("8+ page event website");

  // Branding
  if (answers["branding"] === 3) bullets.push("Advanced custom branding & design");
  else if (answers["branding"] === 1) bullets.push("Standard branding");

  // Products
  if (selectedProducts.length > 0) {
    bullets.push(`Cvent products: ${selectedProducts.join(", ")}`);
  }

  // Attendee Hub
  if (attendeeHubSelected) {
    const hubLine = attendeeHubFeatures.length > 0
      ? `Attendee Hub with ${attendeeHubFeatures.join(", ")}`
      : "Attendee Hub / Event App";
    bullets.push(hubLine);
  }

  return bullets;
}
