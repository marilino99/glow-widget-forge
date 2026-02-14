"use client";

import AutoScroll from "embla-carousel-auto-scroll";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Logo {
  id: string;
  description: string;
  image: string;
  className?: string;
}

interface Logos3Props {
  heading?: string;
  logos?: Logo[];
  className?: string;
}

const Logos3 = ({
  heading = "Trusted by these companies",
  logos = [
    { id: "logo-1", description: "Astro", image: "https://www.shadcnblocks.com/images/block/logos/astro.svg", className: "h-7 w-auto" },
    { id: "logo-2", description: "Figma", image: "https://www.shadcnblocks.com/images/block/logos/figma.svg", className: "h-7 w-auto" },
    { id: "logo-3", description: "Next.js", image: "https://www.shadcnblocks.com/images/block/logos/nextjs.svg", className: "h-7 w-auto" },
    { id: "logo-4", description: "React", image: "https://www.shadcnblocks.com/images/block/logos/react.png", className: "h-7 w-auto" },
    { id: "logo-5", description: "shadcn/ui", image: "https://www.shadcnblocks.com/images/block/logos/shadcn-ui.svg", className: "h-7 w-auto" },
    { id: "logo-6", description: "Supabase", image: "https://www.shadcnblocks.com/images/block/logos/supabase.svg", className: "h-7 w-auto" },
    { id: "logo-7", description: "Tailwind CSS", image: "https://www.shadcnblocks.com/images/block/logos/tailwind.svg", className: "h-4 w-auto" },
    { id: "logo-8", description: "Vercel", image: "https://www.shadcnblocks.com/images/block/logos/vercel.svg", className: "h-7 w-auto" },
  ],
}: Logos3Props) => {
  return (
    <section className="-mt-12 pb-8">
      <div className="container mx-auto flex flex-col items-center text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {heading}
        </p>
      </div>
      <div className="pt-2">
        <div
          className="relative mx-auto flex items-center justify-center lg:max-w-5xl overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.03) 3%, rgba(0,0,0,0.08) 6%, rgba(0,0,0,0.15) 9%, rgba(0,0,0,0.25) 12%, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.6) 18%, rgba(0,0,0,0.8) 22%, black 28%, black 72%, rgba(0,0,0,0.8) 78%, rgba(0,0,0,0.6) 82%, rgba(0,0,0,0.4) 85%, rgba(0,0,0,0.25) 88%, rgba(0,0,0,0.15) 91%, rgba(0,0,0,0.08) 94%, rgba(0,0,0,0.03) 97%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.03) 3%, rgba(0,0,0,0.08) 6%, rgba(0,0,0,0.15) 9%, rgba(0,0,0,0.25) 12%, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.6) 18%, rgba(0,0,0,0.8) 22%, black 28%, black 72%, rgba(0,0,0,0.8) 78%, rgba(0,0,0,0.6) 82%, rgba(0,0,0,0.4) 85%, rgba(0,0,0,0.25) 88%, rgba(0,0,0,0.15) 91%, rgba(0,0,0,0.08) 94%, rgba(0,0,0,0.03) 97%, transparent 100%)",
          }}
        >
          <Carousel
            opts={{ loop: true }}
            plugins={[AutoScroll({ playOnInit: true })]}
          >
            <CarouselContent className="ml-0">
              {logos.map((logo) => (
                <CarouselItem
                  key={logo.id}
                  className="basis-1/3 select-none pl-0 md:basis-1/4 lg:basis-1/6"
                >
                  <div className="mx-10 flex shrink-0 items-center justify-center">
                    <div>
                      <img
                        src={logo.image}
                        alt={logo.description}
                        className={logo.className}
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export { Logos3 };
