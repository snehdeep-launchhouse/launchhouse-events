import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-xl font-semibold text-foreground mb-3">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
  </section>
);

const TermsOfService = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <main className="flex-1 pt-[var(--nav-height)]">
      <div className="container max-w-3xl py-16 px-4">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: February 2026 · LaunchHouse Events, a division of Rina Event Tech</p>
        </div>

        <Section title="1. About These Terms">
          <p>
            These Terms of Service ("Terms") govern your use of the services provided by LaunchHouse Events, a division of Rina Event Tech ("we," "us," or "our"). By submitting a Build Request or engaging our services, you agree to be bound by these Terms.
          </p>
          <p>
            If you have any questions, contact us at{" "}
            <a href="mailto:snehdeep@launchhouse.events" className="text-primary hover:underline">
              snehdeep@launchhouse.events
            </a>.
          </p>
        </Section>

        <Section title="2. Scope of Services">
          <p>
            LaunchHouse Events specialises in the build and configuration of event technology solutions on the Cvent platform. Our services include, but are not limited to:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Event website design and build</li>
            <li>Registration form configuration</li>
            <li>Speaker, session, and agenda management</li>
            <li>Email marketing setup within Cvent</li>
            <li>Reporting and data management configuration</li>
            <li>Event app setup (where applicable)</li>
          </ul>
          <p>
            The exact scope of each engagement is defined at the time of the Build Request and confirmed prior to commencement of work.
          </p>
        </Section>

        <Section title="3. Client Obligations">
          <p>To enable timely delivery of your project, you agree to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Provide all required creative assets (event banner, headers, fonts, branding guidelines) at the start of the engagement</li>
            <li>Supply all required text content and copies prior to build commencement</li>
            <li>Confirm event logistics upfront — including registration types, session structure, ticket types, and speaker information</li>
            <li>Respond to clarification requests within a reasonable timeframe</li>
            <li>Designate a clear point of contact for the duration of the project</li>
          </ul>
          <p>
            Delays in providing required information will result in corresponding adjustments to the agreed delivery deadline. We will notify you as soon as a delay impacts the timeline.
          </p>
        </Section>

        <Section title="4. Delivery Timelines & Same-Day Delivery">
          <p>
            We offer same-day delivery for eligible projects under the following conditions:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Applies to Simple Builds and eligible Medium Builds only</li>
            <li>Advanced and Complex Builds do not qualify for same-day delivery</li>
            <li>All creative assets, branding guidelines, text copies, and event logistics must be provided at the time of request</li>
            <li>Requests received after 12:00 PM IST may be delivered the following business day at our discretion</li>
          </ul>
          <p>
            Delivery timelines for Medium, Advanced, and Complex Builds will be communicated and agreed upon during the kickoff process.
          </p>
        </Section>

        <Section title="5. Revision Rounds">
          <p>Each service tier includes a defined number of revision rounds:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong className="text-foreground">Simple Build</strong> — 1 round of revisions</li>
            <li><strong className="text-foreground">Medium Build</strong> — 2 rounds of revisions</li>
            <li><strong className="text-foreground">Advanced Build</strong> — 3 rounds of revisions</li>
            <li><strong className="text-foreground">Complex Build</strong> — As agreed at the time of scoping</li>
          </ul>
          <p>
            Additional revisions beyond the included rounds may be accommodated at our standard hourly rate or as a separate mini-project, subject to mutual agreement.
          </p>
        </Section>

        <Section title="6. Payment Terms">
          <p>
            Payment terms are agreed upon at the start of each engagement. <em>[Please update this section with your specific payment terms, invoicing schedule, and accepted payment methods.]</em>
          </p>
          <p>
            We reserve the right to pause or withhold delivery of work in the event of outstanding payments.
          </p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>
            Upon receipt of full payment, all deliverables produced for your event will be owned by you. We retain the right to reference the engagement in our portfolio unless you request otherwise in writing.
          </p>
          <p>
            You warrant that all assets, content, and materials you provide to us are owned by you or that you have the right to use them. We are not liable for any third-party intellectual property claims arising from materials you supply.
          </p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>
            To the maximum extent permitted by applicable law, LaunchHouse Events / Rina Event Tech shall not be liable for any indirect, incidental, consequential, or special damages arising out of or in connection with the services provided, even if we have been advised of the possibility of such damages.
          </p>
          <p>
            Our total liability to you for any claim arising out of or relating to these Terms shall not exceed the total fees paid by you for the specific service giving rise to the claim.
          </p>
        </Section>

        <Section title="9. Termination">
          <p>
            Either party may terminate an engagement by providing written notice. In the event of termination, you are responsible for payment of all work completed up to the date of termination. We will provide a final invoice for work delivered.
          </p>
        </Section>

        <Section title="10. Governing Law">
          <p>
            These Terms are governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of India.
          </p>
        </Section>

        <Section title="11. Changes to These Terms">
          <p>
            We may update these Terms from time to time. The updated version will be posted on this page with a revised date. Continued use of our services after any update constitutes acceptance of the new Terms.
          </p>
        </Section>
      </div>
    </main>
    <Footer />
  </div>
);

export default TermsOfService;
