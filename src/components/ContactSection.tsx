import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Inquiry from ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    window.location.href = `mailto:snehdeep@launchhouse.events?subject=${subject}&body=${body}`;
    toast({
      title: "Opening your email client",
      description: "Your default mail app will handle the message.",
    });
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-secondary/40">
      <div className="container max-w-2xl">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">Contact Us</p>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight">
            Let's Build Your Next Event
          </h2>
          <p className="text-muted-foreground mt-4">
            Tell us about your project. We'll get back to you within 24 hours.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-xl p-8 shadow-card border border-border/50 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <Input
                required
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input
                required
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Message</label>
            <Textarea
              required
              rows={5}
              placeholder="Tell us about your event and what you need..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full shadow-btn">
            <Send className="w-4 h-4 mr-2" /> Send Message
          </Button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          <a href="mailto:snehdeep@launchhouse.events" className="hover:text-primary transition-colors">
            snehdeep@launchhouse.events
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
