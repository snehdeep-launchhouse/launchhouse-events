import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import { setPageSeo } from "@/lib/seo-head";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-xl font-semibold text-foreground mb-3">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
  </section>
);

interface ServiceRowData {
  service: string;
  activities: string[];
  outOfScope?: string[];
}

const ServiceCard = ({ service, activities, outOfScope }: ServiceRowData) => (
  <div className="rounded-lg border border-border/40 p-4 space-y-3">
    <h3 className="font-semibold text-foreground text-sm">{service}</h3>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1.5">Included</p>
      <ul className="space-y-1">
        {activities.map((a, i) => (
          <li key={i} className="text-sm flex gap-2 text-muted-foreground">
            <span className="text-primary mt-1 shrink-0">·</span><span>{a}</span>
          </li>
        ))}
      </ul>
    </div>
    {outOfScope && outOfScope.length > 0 && (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Out of Scope</p>
        <ul className="space-y-1">
          {outOfScope.map((o, i) => (
            <li key={i} className="text-sm flex gap-2 text-muted-foreground/70">
              <span className="text-muted-foreground/50 mt-1 shrink-0">·</span><span>{o}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const TableRow = ({ service, activities, outOfScope }: ServiceRowData) => (
  <tr className="border-b border-border/40">
    <td className="py-3 pr-4 align-top font-medium text-foreground w-1/5 text-sm">{service}</td>
    <td className="py-3 pr-4 align-top w-2/5">
      <ul className="space-y-1">
        {activities.map((a, i) => (
          <li key={i} className="text-sm flex gap-2"><span className="text-primary mt-1 shrink-0">·</span><span>{a}</span></li>
        ))}
      </ul>
    </td>
    <td className="py-3 align-top w-2/5">
      {outOfScope && outOfScope.length > 0 ? (
        <ul className="space-y-1">
          {outOfScope.map((o, i) => (
            <li key={i} className="text-sm flex gap-2"><span className="text-muted-foreground/50 mt-1 shrink-0">·</span><span className="text-muted-foreground/70">{o}</span></li>
          ))}
        </ul>
      ) : null}
    </td>
  </tr>
);

const serviceRows: ServiceRowData[] = [
  {
    service: "Registration",
    activities: [
      "Path setting configurations",
      "Registration questions/fields setup",
      "Implementation of industry best practices",
      "Complete testing and auditing before review submission",
    ],
    outOfScope: ["No support after event goes live unless purchased premium"],
  },
  {
    service: "Agenda",
    activities: [
      "Implementation of admission items",
      "Sessions",
      "Optional items",
      "Registration type availability",
      "Session groups",
    ],
  },
  {
    service: "Fee",
    activities: [
      "Implementation of fee on individual items",
      "Setting up refund policy if applicable",
      "Associating available merchant account with the event",
      "Assisting in conducting a test transaction before event launch",
    ],
    outOfScope: ["Associating merchant account with Cvent account"],
  },
  {
    service: "Website",
    activities: [
      "Implementation of graphics provided by client",
      "Activation of relevant web pages pertaining to client's request and event setup",
      "Implementation of industry best practices",
    ],
  },
  {
    service: "Email",
    activities: [
      "Default email templates creation",
      "Custom email templates based on event requirements",
      "Implementation of graphics on email header and footer as provided by client",
    ],
  },
  {
    service: "Feedback Surveys",
    activities: [
      "Creation of questions as required based on Basic or Premium survey licence",
      "Implementation of graphics as provided",
    ],
  },
  {
    service: "Reports",
    activities: [
      "Implementation of Master report",
      "Custom reports based on client's requirements",
    ],
    outOfScope: ["Manual report tracking"],
  },
  {
    service: "Speaker Resource Centre / Speaker Management",
    activities: [
      "Importing in bulk or creating speakers manually",
      "Uploading speaker headshots",
      "Sending speaker invitation email",
      "Creating tasks as requested by client",
      "Implementation of graphics as provided",
    ],
    outOfScope: [
      "Speaker training",
      "Moderator training",
      "Speaker support",
      "Group technical training",
    ],
  },
  {
    service: "Exhibitor Management",
    activities: [
      "Importing in bulk or creating exhibitors manually",
      "Sending exhibitor invitation email",
      "Creating exhibitor default templates",
      "Creating tasks as requested by client",
      "Exhibitor portal configuration settings",
      "Sponsored sessions",
      "Virtual Booth configuration",
    ],
    outOfScope: ["Exhibitor training"],
  },
  {
    service: "Appointments",
    activities: [
      "Appointments setup configurations",
      "Test appointment setup",
      "Schedule rules, group assignments, time slots etc.",
      "Virtual appointment setup",
    ],
    outOfScope: ["Appointment training"],
  },
  {
    service: "Virtual Attendee Hub",
    activities: [
      "Implementation of graphics as provided by client",
      "Settings configuration",
      "Attendee hub walkthrough call",
      "Event app walkthrough",
      "Event app configuration",
      "Dry run call",
    ],
    outOfScope: [
      "Speaker or moderator trainings",
      "Technical trainings",
      "Day of support",
      "Branded event app submission",
    ],
  },
  {
    service: "Cvent Studio",
    activities: [
      "Session configuration",
      "Cvent Studio walkthrough",
      "Cvent Studio prep call",
      "Cvent Studio dry run",
    ],
    outOfScope: [
      "Cvent Studio training",
      "Video player in session configuration",
      "Day of support",
      "Debrief call",
    ],
  },
];

const projectMgmtActivities = [
  "Event setup call (registration and website)",
  "Milestone walkthrough calls (round of changes)",
  "Project Plan and Timeline Creation",
  "Project/Event consultation",
  "Coordination and tracking of project activities",
  "Outline of client deliverables",
  "Email response within 6 business hours (90 minutes for Same Day Delivery builds)",
  "Virtual Event Platform configuration including implementation of client-provided graphics and virtual session configuration",
  "Exhibitor portal/management configuration",
  "Speaker Resource Center configuration",
  "Appointment configuration",
  "Feedback survey implementation",
  "Timely delivery of drafts",
  "Issue tracking and management",
  "Testing of all deliverables prior to launch",
  "Report creation and modification",
  "Final sign off",
];

const projectMgmtOutOfScope = [
  "Questions related to Advance Production, Day of Support, Trainings, Merchant account setup, Custom domain setup",
  "Dry/Test Run – Virtual Session Configuration if a Project Manager is involved",
  "Creation of graphics",
  "Integration implementation, configuration, and support",
  "Working with non-Cvent products",
  "Content creation, including translation services",
  "Staffing or support in-person at events",
];

const slaRows = [
  { level: "Simple", draft: "2 Business Days", revision: "1 Business Day" },
  { level: "Medium", draft: "2 Business Days", revision: "2 Business Days" },
  { level: "Advanced", draft: "3 Business Days", revision: "3 Business Days" },
  { level: "Complex", draft: "4 Business Days", revision: "3 Business Days" },
];

const hoursRows = [
  { build: "Simple", hours: "20 hours" },
  { build: "Medium", hours: "45 hours" },
  { build: "Advanced", hours: "65 hours" },
  { build: "Complex", hours: "100 hours" },
  { build: "Premium", hours: ">100 hours" },
];

const TermsOfService = () => {
  useEffect(() => setPageSeo({
    title: "Terms of Service — LaunchHouse Events",
    description: "Terms of Service governing the use of LaunchHouse Events' Cvent event build and configuration services.",
    path: "/terms-of-service",
  }), []);
  return (
  <div className="min-h-screen flex flex-col bg-background">
    <BreadcrumbJsonLd items={[{ name: "Terms of Service", path: "/terms-of-service" }]} />
    <Navbar />
    <main className="flex-1 pt-[var(--nav-height)]">
      <div className="container max-w-5xl py-16 px-4">

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: February 2026 · LaunchHouse Events, a division of Rina Event Tech</p>
        </div>

        {/* Intro */}
        <section className="mb-10">
          <div className="text-muted-foreground leading-relaxed space-y-3">
            <p>
              These Terms of Service ("Terms") govern your use of the services provided by LaunchHouse Events, a division of Rina Event Tech ("we," "us," or "our"). By submitting a Build Request or engaging our services, you agree to be bound by these Terms.
            </p>
            <p>
              LaunchHouse Events will perform the services described herein, including delivery of any tangible or intangible items ("Services") set forth below. LaunchHouse Events acknowledges that the customer is looking for a solution that can meet their specific event needs on the Cvent platform.
            </p>
            <p className="text-sm border border-border/50 rounded-md px-4 py-3 bg-muted/20">
              <strong className="text-foreground">Note:</strong> Out-of-scope tasks can be supported if purchased in addition to the event build services.
            </p>
          </div>
        </section>

        {/* Scope of Services */}
        <Section title="1. Event Build Scope of Services">
          <p className="mb-4">The following outlines what is included and excluded for each service area in a standard event build engagement.</p>

          {/* Mobile: Cards */}
          <div className="md:hidden space-y-4">
            <ServiceCard
              service="Project Management (General)"
              activities={projectMgmtActivities}
              outOfScope={projectMgmtOutOfScope}
            />
            {serviceRows.map((row) => (
              <ServiceCard key={row.service} {...row} />
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-border/40">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border/40">
                  <th className="py-3 pr-4 pl-4 text-left font-semibold text-foreground w-1/5">Service</th>
                  <th className="py-3 pr-4 text-left font-semibold text-foreground w-2/5">Activities (In Scope)</th>
                  <th className="py-3 text-left font-semibold text-muted-foreground w-2/5">Out of Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                <tr className="border-b border-border/40">
                  <td className="py-3 pl-4 pr-4 align-top font-medium text-foreground text-sm">Project Management (General)</td>
                  <td className="py-3 pr-4 align-top">
                    <ul className="space-y-1">
                      {projectMgmtActivities.map((a, i) => (
                        <li key={i} className="text-sm flex gap-2"><span className="text-primary mt-1 shrink-0">·</span><span>{a}</span></li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3 align-top">
                    <ul className="space-y-1">
                      {projectMgmtOutOfScope.map((o, i) => (
                        <li key={i} className="text-sm flex gap-2"><span className="text-muted-foreground/50 mt-1 shrink-0">·</span><span className="text-muted-foreground/70">{o}</span></li>
                      ))}
                    </ul>
                  </td>
                </tr>
                {serviceRows.map((row) => (
                  <TableRow key={row.service} {...row} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Same Day Delivery definition block */}
          <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 px-5 py-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">Same Day Delivery</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Same Day Delivery is available exclusively for <strong className="text-foreground">Simple</strong> and eligible <strong className="text-foreground">Medium</strong> Builds. To qualify, the project must commence on or before <strong className="text-foreground">8:00 AM Eastern Time</strong> (Monday–Friday). Upon receipt of all required creative assets, event logistics, and <strong className="text-foreground">100% advance payment</strong>, LaunchHouse Events guarantees delivery by <strong className="text-foreground">8:00 PM Eastern Time</strong> on the same day — a 12-hour turnaround window.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Should LaunchHouse Events fail to meet this deadline, the client is entitled to a <strong className="text-foreground">full refund</strong>, which will be processed within <strong className="text-foreground">48 hours</strong>. Pre-requisites for same day delivery — creative assets such as Event Banner, Headers, Fonts, Branding Guidelines, and Text Copies must be readily available. Event logistics including number of registration types, sessions, and ticket types must also be confirmed from the onset. Any delays in handing over required information will push the delivery deadline accordingly.
            </p>
          </div>
        </Section>

        {/* Project Plan */}
        <Section title="2. Project Plan & Delivery Timelines">
          <p>
            LaunchHouse Events will exercise reasonable best efforts to complete all deliverables based upon information provided prior to engagement commencement and the assumptions, project dependencies, and responsibilities set forth in these Terms. Actual dates may vary depending on start date and other factors; the schedule reflects the scope of effort assumed and is dependent on the client meeting all responsibilities in a timely manner.
          </p>
          <div className="rounded-lg border border-border/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border/40">
                  <th className="py-3 pl-4 pr-4 text-left font-semibold text-foreground">Complexity</th>
                  <th className="py-3 pr-4 text-left font-semibold text-foreground">First Draft</th>
                  <th className="py-3 pr-4 text-left font-semibold text-foreground">Revision Turnaround</th>
                </tr>
              </thead>
              <tbody>
                {slaRows.map((r) => (
                  <tr key={r.level} className="border-b border-border/30 last:border-0">
                    <td className="py-3 pl-4 pr-4 font-medium text-foreground">{r.level}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.draft}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.revision}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground/70 italic">Timelines begin once all necessary content and assets are provided.</p>
          <p>LaunchHouse Events will be responsible for the following deliverables:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Gather and analyse client requirements</li>
            <li>Consult on features best suitable for the event and provide recommendations for any workarounds where applicable</li>
            <li>Create event-specific deliverables according to client's templates, processes, or within brand guidelines</li>
            <li>Share event-related industry standard best practices</li>
            <li>Maintain graphic and document libraries</li>
            <li>Maintain company event templates (ensuring branding guidelines are met)</li>
            <li>Coordinate with the client's creative team for branding guidelines and graphics creation</li>
            <li>Notify authorised users about any updates or maintenance performed on the Cvent system until project sign off</li>
            <li>Educate new users on client/company standard operating procedures and best practices associated with the website registration process</li>
          </ul>
          <p>
            All requests made in writing by the client will receive an acknowledgement of receipt within 6 hours of that very same day. If the dedicated resource is out of the office, an acknowledgement will be sent within one (1) business day after returning to the office.
          </p>
        </Section>

        {/* Process */}
        <Section title="3. Process & Hours">
          <p>Each project comes with a set of hours allotted based on the build type, as defined below.</p>
          <div className="rounded-lg border border-border/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border/40">
                  <th className="py-3 pl-4 pr-4 text-left font-semibold text-foreground">Build Type</th>
                  <th className="py-3 pr-4 text-left font-semibold text-foreground">Hours Allocated</th>
                </tr>
              </thead>
              <tbody>
                {hoursRows.map((r) => (
                  <tr key={r.build} className="border-b border-border/30 last:border-0">
                    <td className="py-3 pl-4 pr-4 font-medium text-foreground">{r.build}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>A LaunchHouse Events consultant will sign off from the project/event when the allotted number of hours is consumed, or the event is launched — whichever comes earlier</li>
            <li>Post event launch support is not included as part of a regular package</li>
            <li>A premium hours-based project will cover post launch support if the event is launched with hours remaining</li>
            <li>Additional project hours can be purchased at an additional cost — the number of hours required will be scoped by your LaunchHouse Events consultant</li>
            <li>Any delays in receiving information will push deadlines and event launch dates; a revised project plan will be submitted accordingly</li>
          </ul>
        </Section>

        {/* Project Change Control */}
        <Section title="4. Project Change Control">
          <p>
            Either party may, from time to time, request a change to the agreed scope of services, deliverables, project schedule, fee, or any other aspect of the engagement. In response, LaunchHouse Events will prepare a Change Order reflecting the proposed changes — including but not limited to impact on deliverables, project schedule, and fees — and shall deliver such Change Order to the client for review and negotiation. Absent a Change Order signed by both parties, LaunchHouse Events shall not be bound to perform any additional or out-of-scope services beyond what is agreed.
          </p>
          <p className="font-semibold text-foreground">Important:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Rounds of changes must be submitted by the client in a single consolidated document. Changes received across multiple emails will lead to delays in response and misses</li>
            <li>Clients should thoroughly review all changes before submission</li>
            <li>Completion of changes will vary depending on the number of updates to be implemented; LaunchHouse Events will inform the client upfront if additional time is required</li>
            <li>Any delays in receiving the round of changes will lead to a delay in project/event launch</li>
          </ul>
        </Section>

        {/* Client Obligations */}
        <Section title="5. Client Obligations">
          <p>To enable timely delivery of your project, you agree to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Provide all required creative assets (event banner, headers, fonts, branding guidelines) at the start of the engagement</li>
            <li>Supply all required text content and copies prior to build commencement</li>
            <li>Confirm event logistics upfront — including registration types, session structure, ticket types, and speaker information</li>
            <li>Respond to clarification requests within a reasonable timeframe</li>
            <li>Designate a clear point of contact for the duration of the project</li>
          </ul>
          <p>
            Delays in providing required information will result in corresponding adjustments to the agreed delivery deadline. LaunchHouse Events will notify you as soon as a delay impacts the timeline.
          </p>
        </Section>

        {/* Revision Rounds */}
        <Section title="6. Revision Rounds">
          <p>
            All build tiers include <strong className="text-foreground">unlimited rounds of revisions</strong>, provided they are completed within the hours allocated for that build type as defined at the onset of the engagement.
          </p>
        </Section>

        {/* Payment & Refund Terms */}
        <Section title="7. Payment & Refund Terms">
          <p className="font-semibold text-foreground">Payment Options</p>
          <div className="space-y-3">
            <div className="rounded-md border border-border/40 px-4 py-3 bg-muted/10">
              <p className="text-sm font-semibold text-foreground mb-1">Option 1 — Staged Payment</p>
              <p className="text-sm text-muted-foreground">A minimum booking deposit of <strong className="text-foreground">50%</strong> is required to commence the project. The remaining balance must be settled upon submission of the First Draft.</p>
            </div>
            <div className="rounded-md border border-border/40 px-4 py-3 bg-muted/10">
              <p className="text-sm font-semibold text-foreground mb-1">Option 2 — Full Advance Payment</p>
              <p className="text-sm text-muted-foreground">Pay <strong className="text-foreground">100% upfront</strong> and receive a flat <strong className="text-foreground">10% discount</strong> applied to the final invoice.</p>
            </div>
          </div>
          <p>
            LaunchHouse Events reserves the right to pause or withhold delivery of work in the event of outstanding payments.
          </p>
          <p className="font-semibold text-foreground pt-1">Refunds</p>
          <p>
            All eligible refunds, as agreed per contract, will be issued by LaunchHouse Events within <strong className="text-foreground">48 hours</strong> of confirmed eligibility. We will always aim to refund to the original source of payment. If a client requests a refund to a different account or payment method, additional supporting documentation may be requested before the refund is processed.
          </p>
        </Section>

        {/* IP */}
        <Section title="8. Intellectual Property">
          <p>
            Upon receipt of full payment, all deliverables produced for your event will be owned by you. We retain the right to reference the engagement in our portfolio unless you request otherwise in writing.
          </p>
          <p>
            You warrant that all assets, content, and materials you provide to us are owned by you or that you have the right to use them. LaunchHouse Events is not liable for any third-party intellectual property claims arising from materials you supply.
          </p>
        </Section>

        {/* Liability */}
        <Section title="9. Limitation of Liability">
          <p>
            To the maximum extent permitted by applicable law, LaunchHouse Events / Rina Event Tech (GSTIN: 29AIKPC3628E1ZE · IEC: AIKPC3628E) shall not be liable for any indirect, incidental, consequential, or special damages arising out of or in connection with the services provided, even if we have been advised of the possibility of such damages.
          </p>
          <p>
            Our total liability to you for any claim arising out of or relating to these Terms shall not exceed the total fees paid by you for the specific service giving rise to the claim.
          </p>
        </Section>

        {/* Termination */}
        <Section title="10. Termination">
          <p>
            Either party may terminate an engagement by providing written notice. In the event of termination, you are responsible for payment of all work completed up to the date of termination. LaunchHouse Events will provide a final invoice for work delivered.
          </p>
        </Section>

        {/* Governing Law */}
        <Section title="11. Governing Law">
          <p>
            These Terms are governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of India.
          </p>
        </Section>

        {/* Changes */}
        <Section title="12. Changes to These Terms">
          <p>
            We may update these Terms from time to time. The updated version will be posted on this page with a revised date. Continued use of our services after any update constitutes acceptance of the new Terms.
          </p>
          <p>
            If you have any questions, contact us at{" "}
            <a href="mailto:snehdeep@launchhouse.events" className="text-primary hover:underline">
              snehdeep@launchhouse.events
            </a>.
          </p>
        </Section>

      </div>
    </main>
    <Footer />
  </div>
  );
};


export default TermsOfService;
