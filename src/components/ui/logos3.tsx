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
    { id: "logo-1", description: "Flowbase", image: "https://cdn.prod.website-files.com/6347e15ca4877d0747a00580/637193655a8e5c8b0b3e5e8e_Flowbase.svg", className: "h-6 w-auto brightness-0 invert opacity-70" },
    { id: "logo-2", description: "Jasper", image: "https://cdn.prod.website-files.com/6347e15ca4877d0747a00580/637193655a8e5c632c3e5e91_Jasper.svg", className: "h-6 w-auto brightness-0 invert opacity-70" },
    { id: "logo-3", description: "Zoomer", image: "https://cdn.prod.website-files.com/6347e15ca4877d0747a00580/637193655a8e5c170e3e5e8f_Zoomer.svg", className: "h-6 w-auto brightness-0 invert opacity-70" },
    { id: "logo-4", description: "Spherule", image: "https://cdn.prod.website-files.com/6347e15ca4877d0747a00580/637193655a8e5c46b93e5e90_Spherule.svg", className: "h-6 w-auto brightness-0 invert opacity-70" },
    { id: "logo-5", description: "GlobalBank", image: "https://cdn.prod.website-files.com/6347e15ca4877d0747a00580/637193655a8e5c6e243e5e92_GlobalBank.svg", className: "h-6 w-auto brightness-0 invert opacity-70" },
    { id: "logo-6", description: "Nietzsche", image: "https://cdn.prod.website-files.com/6347e15ca4877d0747a00580/637193655a8e5c02413e5e93_Nietzsche.svg", className: "h-6 w-auto brightness-0 invert opacity-70" },
    { id: "logo-7", description: "Boltshift", image: "https://cdn.prod.website-files.com/6347e15ca4877d0747a00580/63719364b1a3a8672a3e5e84_Boltshift.svg", className: "h-6 w-auto brightness-0 invert opacity-70" },
    { id: "logo-8", description: "Lightbox", image: "https://cdn.prod.website-files.com/6347e15ca4877d0747a00580/637193655a8e5c209c3e5e8d_Lightbox.svg", className: "h-6 w-auto brightness-0 invert opacity-70" },
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
          className="relative mx-auto flex items-center justify-center lg:max-w-6xl px-16 overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 8%, rgba(0,0,0,0.2) 14%, rgba(0,0,0,0.5) 20%, rgba(0,0,0,0.85) 28%, black 35%, black 65%, rgba(0,0,0,0.85) 72%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.2) 86%, rgba(0,0,0,0.05) 92%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 8%, rgba(0,0,0,0.2) 14%, rgba(0,0,0,0.5) 20%, rgba(0,0,0,0.85) 28%, black 35%, black 65%, rgba(0,0,0,0.85) 72%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.2) 86%, rgba(0,0,0,0.05) 92%, transparent 100%)",
          }}
        >
          <Carousel
            opts={{ loop: true }}
            plugins={[AutoScroll({ playOnInit: true })]}
            className="[&>div]:!overflow-visible"
          >
            <CarouselContent className="ml-0">
              {logos.map((logo) => (
                <CarouselItem
                  key={logo.id}
                  className="basis-1/3 select-none pl-0 md:basis-1/4 lg:basis-1/6"
                >
                  <div className="mx-10 flex shrink-0 items-center justify-center">
                    {logo.image ? (
                      <img
                        src={logo.image}
                        alt={logo.description}
                        className={logo.className}
                      />
                    ) : (
                      <span className="text-lg font-bold tracking-tight text-muted-foreground/60 whitespace-nowrap select-none">
                        {logo.description}
                      </span>
                    )}
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
