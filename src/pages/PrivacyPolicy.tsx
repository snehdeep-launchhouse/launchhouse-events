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

const PrivacyPolicy = () => {
  useEffect(() => setPageSeo({
    title: "Privacy Policy — LaunchHouse Events",
    description: "How LaunchHouse Events collects, uses, and safeguards personal information submitted through our website and Build Requests.",
    path: "/privacy-policy",
  }), []);

  return (
  <div className="min-h-screen flex flex-col bg-background">
    <BreadcrumbJsonLd items={[{ name: "Privacy Policy", path: "/privacy-policy" }]} />
    <Navbar />
    <main className="flex-1 pt-[var(--nav-height)]">
      <div className="container max-w-3xl py-16 px-4">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: February 2026 · LaunchHouse Events, a division of Rina Event Tech</p>
        </div>

        <Section title="1. Who We Are">
          <p>
            LaunchHouse Events is a division of Rina Event Tech, an event technology services company based in India. We provide Cvent event build and configuration services to corporate clients worldwide. This Privacy Policy explains how we collect, use, and safeguard the personal information you provide when using our website or submitting a Build Request.
          </p>
          <p>
            For any privacy-related questions, contact us at{" "}
            <a href="mailto:snehdeep@launchhouse.events" className="text-primary hover:underline">
              snehdeep@launchhouse.events
            </a>.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect personal information only when you voluntarily submit a Build Request form. This may include:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>First and last name</li>
            <li>Business email address</li>
            <li>Phone number</li>
            <li>Company or organization name</li>
            <li>Event details (title, dates, timezone, session and registration type information)</li>
            <li>Preferred kickoff dates and go-live date</li>
            <li>Additional information you choose to provide</li>
            <li>Contacts designated as event planners or points of contact</li>
          </ul>
          <p>We do not collect any information through cookies beyond what is strictly necessary to operate the website. We do not use third-party tracking or advertising cookies.</p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>Information you provide is used solely to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Respond to and fulfil your Build Request</li>
            <li>Communicate with you about your project scope, timelines, and deliverables</li>
            <li>Send confirmation and status notifications related to your request</li>
          </ul>
          <p>We do not sell, rent, or share your personal data with third parties for marketing purposes. Your data is never used for purposes other than delivering the services you have requested.</p>
        </Section>

        <Section title="4. Data Storage and Retention">
          <p>
            Build Request data is stored securely in our cloud backend. We retain your information for as long as is necessary to fulfil the services requested and for a reasonable period thereafter for record-keeping purposes (typically no longer than 2 years from your last interaction with us).
          </p>
          <p>
            After the retention period, your data is deleted from our systems. You may request earlier deletion at any time (see Section 5).
          </p>
        </Section>

        <Section title="5. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong className="text-foreground">Access</strong> — request a copy of the personal data we hold about you</li>
            <li><strong className="text-foreground">Correction</strong> — ask us to correct inaccurate or incomplete data</li>
            <li><strong className="text-foreground">Deletion</strong> — request that we delete your personal data</li>
            <li><strong className="text-foreground">Objection</strong> — object to how we are using your data</li>
          </ul>
          <p>
            To exercise any of these rights, email us at{" "}
            <a href="mailto:snehdeep@launchhouse.events" className="text-primary hover:underline">
              snehdeep@launchhouse.events
            </a>{" "}
            with the subject line "Data Request." We will respond within 30 days.
          </p>
        </Section>

        <Section title="6. Data Security">
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Access to your data is restricted to personnel who need it to provide our services.
          </p>
        </Section>

        <Section title="7. Third-Party Services">
          <p>
            Our website is built on a secure cloud infrastructure. We may use essential third-party services (such as email delivery) solely for the purpose of communicating with you regarding your Build Request. These providers are bound by confidentiality obligations and are not permitted to use your data for any other purpose.
          </p>
        </Section>

        <Section title="8. Governing Law">
          <p>
            This Privacy Policy is governed by the laws of India. Any disputes arising in connection with this policy shall be subject to the exclusive jurisdiction of the courts of India.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised date. We encourage you to review this page periodically.
          </p>
        </Section>
      </div>
    </main>
    <Footer />
  </div>
  );
};


export default PrivacyPolicy;
