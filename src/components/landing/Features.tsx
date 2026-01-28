import { Palette, Clock, BarChart3, Code2 } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Visual Customization",
    description:
      "Design pixel-perfect popups with colors, fonts, layouts, and shadows that match your brand.",
  },
  {
    icon: Clock,
    title: "Smart Triggers",
    description:
      "Show popups at the right moment—on scroll, after delay, or when visitors are about to leave.",
  },
  {
    icon: BarChart3,
    title: "A/B Testing",
    description:
      "Test different designs and products to discover what converts best for your audience.",
  },
  {
    icon: Code2,
    title: "Easy Embed",
    description:
      "Copy one line of code and your widget works on any website, CMS, or e-commerce platform.",
  },
];

const Features = () => {
  return (
    <section className="bg-muted/30 py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to boost sales
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete toolkit for creating high-converting product recommendation widgets.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/20 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
