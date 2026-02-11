import { Settings, LayoutTemplate, Users, BarChart3 } from "lucide-react";

const services = [
  {
    icon: LayoutTemplate,
    title: "Registration Builds",
    description:
      "From simple single-page forms to complex multi-session registrations with conditional logic, approval workflows, and payment integration.",
  },
  {
    icon: Settings,
    title: "Cvent Configuration",
    description:
      "Custom fields, email templates, reports, attendee management — we configure your Cvent instance to match your exact event needs.",
  },
  {
    icon: Users,
    title: "Ongoing Management",
    description:
      "Don't have an in-house team? We handle day-to-day registration management, attendee support, and real-time troubleshooting.",
  },
  {
    icon: BarChart3,
    title: "Optimization & Reporting",
    description:
      "Unlock insights from your event data. We create custom reports, optimize conversion rates, and improve attendee experience.",
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
          You have the license. We bring the expertise to make it work — on your timeline and budget.
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
