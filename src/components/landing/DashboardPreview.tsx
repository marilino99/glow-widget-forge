import { Monitor, Smartphone, ChevronRight, MessageSquare, Phone, HelpCircle, Link2, Grid3X3, Gift, Users, Star, Home, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="relative px-6 py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="text-sm font-medium uppercase tracking-widest text-primary">Dashboard</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            One place for everything
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Manage all your widgets, conversations, and analytics from a single intuitive dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/5">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-5 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20">
                  <Grid3X3 className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Add to website</span>
              </div>
              <div className="flex items-center gap-4">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Chat</span>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <div className="h-7 w-7 rounded-full bg-primary/20" />
              </div>
            </div>

            <div className="flex min-h-[480px]">
              {/* Left sidebar */}
              <div className="hidden w-64 border-r border-border/50 bg-background p-5 md:block">
                <h3 className="text-base font-semibold text-foreground mb-5">Widget content</h3>

                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-primary">Provide help</p>
                <div className="space-y-0.5">
                  {[
                    { icon: Monitor, label: "Contact card" },
                    { icon: Phone, label: "WhatsApp" },
                    { icon: MessageSquare, label: "Messenger" },
                    { icon: HelpCircle, label: "FAQ", toggle: true },
                    { icon: Link2, label: "Custom links" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.toggle && (
                          <div className="h-4 w-8 rounded-full bg-muted-foreground/20" />
                        )}
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mb-2 mt-5 text-[10px] font-semibold uppercase tracking-wider text-primary">Boost sales</p>
                <div className="space-y-0.5">
                  {[
                    { icon: Grid3X3, label: "Product carousel" },
                    { icon: Gift, label: "Product recommendations" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </div>
                  ))}
                </div>

                <p className="mb-2 mt-5 text-[10px] font-semibold uppercase tracking-wider text-primary">Build trust</p>
                <div className="space-y-0.5">
                  {[
                    { icon: Users, label: "Visitor counter", toggle: true },
                    { icon: Star, label: "Google reviews" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.toggle && (
                          <div className="h-4 w-8 rounded-full bg-muted-foreground/20" />
                        )}
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main content area – browser preview */}
              <div className="relative flex-1 bg-muted/20 p-6">
                {/* Browser chrome */}
                <div className="rounded-xl border border-border/50 bg-background overflow-hidden shadow-sm">
                  {/* Browser top bar */}
                  <div className="flex items-center gap-4 border-b border-border/40 bg-muted/30 px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                      <span className="text-[10px] text-muted-foreground">Previewing</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                      <Smartphone className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="rounded-md bg-muted/60 px-3 py-1">
                        <span className="text-[10px] text-muted-foreground">https://yoursite.com</span>
                      </div>
                      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary">
                        <ChevronRight className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* Fake page content */}
                  <div className="p-8 space-y-5 min-h-[340px]">
                    <div className="h-8 w-44 rounded bg-muted/60" />
                    <div className="space-y-2">
                      <div className="h-2.5 w-3/4 rounded bg-muted/40" />
                      <div className="h-2.5 w-1/2 rounded bg-muted/40" />
                    </div>
                    <div className="h-28 w-3/4 rounded-lg bg-muted/30" />
                    <div className="space-y-2">
                      <div className="h-2.5 w-3/4 rounded bg-muted/40" />
                      <div className="h-2.5 w-1/2 rounded bg-muted/40" />
                    </div>
                    <div className="flex gap-4">
                      <div className="h-20 w-1/3 rounded-lg bg-muted/30" />
                      <div className="h-20 w-1/3 rounded-lg bg-muted/30" />
                      <div className="h-20 w-1/3 rounded-lg bg-muted/30" />
                    </div>
                  </div>
                </div>

                {/* Chat widget overlay */}
                <div className="absolute bottom-8 right-8 w-56 rounded-2xl bg-[hsl(210,15%,15%)] text-white shadow-2xl overflow-hidden">
                  <div className="px-5 pt-5 pb-3">
                    <p className="text-base font-bold leading-snug">Hello, nice to see you here 👋</p>
                  </div>
                  <div className="bg-[hsl(210,10%,20%)] px-4 py-3 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-primary/30" />
                      <div>
                        <p className="text-[10px] text-white/60">Maksim</p>
                        <p className="text-xs">How can I help you?</p>
                      </div>
                    </div>
                    <button className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground">
                      Contact us
                    </button>
                    <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-medium">
                      <Phone className="h-3 w-3" />
                      Contact us on WhatsApp
                    </button>
                  </div>
                  <div className="flex border-t border-white/10">
                    <div className="flex flex-1 flex-col items-center gap-1 py-2.5 text-white/80">
                      <Home className="h-4 w-4" />
                      <span className="text-[9px]">Home</span>
                    </div>
                    <div className="flex flex-1 flex-col items-center gap-1 py-2.5 text-white/40">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-[9px]">Contact</span>
                    </div>
                  </div>
                  <p className="pb-2 text-center text-[8px] text-white/30">Powered by Widjett</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
