import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="bg-primary py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to increase your conversions?
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/80">
            Join hundreds of stores using our widgets to drive more sales.
          </p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="gap-2"
          >
            <Link to="/signup">
              Get started for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
