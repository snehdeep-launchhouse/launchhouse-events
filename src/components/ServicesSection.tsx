import { Settings, LayoutTemplate, Users, BarChart3 } from "lucide-react";

const services = [
  {
    icon: LayoutTemplate,
    title: "Cvent Registration Builds",
    description:
      "We build your event registration experience inside Cvent — including registration pages, types, session selection, branded confirmation emails, and attendee-facing flow.",
  },
  {
    icon: Settings,
    title: "Attendee Hub & Mobile App Readiness",
    description:
      "We build and configure the Cvent Attendee Hub and prepare the event app with content, branding, session schedules, and pre-launch testing.",
  },
  {
    icon: Users,
    title: "Event Tech QA",
    description:
      "We test your registration build, email workflows, and attendee journeys end-to-end before your event goes live — so issues are caught before your attendees are.",
  },
  {
    icon: BarChart3,
    title: "Ongoing Event Support",
    description:
      "After launch, we handle attendee updates, troubleshooting, content changes, and real-time support through your full event lifecycle.",
  },
];

const ServicesSection = () => (
  <section id="services" className="py-24 md:py-32">
    <div className="container">
      <div className="text-center mb-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">What We Do</p>
        <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">
          Expert Cvent Services, On Demand
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          We handle the Cvent builds, configuration, testing, and support your team needs to launch cleaner events with less last-minute pressure.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((s) => (
          <div
            key={s.title}
            className="group bg-card-gradient rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50 hover:border-primary/20"
          >
            <div className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <s.icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold font-display mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
