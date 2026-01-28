import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const sampleProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: "$79.99",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: "$199.99",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop",
  },
  {
    id: 3,
    name: "Running Shoes",
    price: "$129.99",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
  },
];

const WidgetPreview = () => {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            See it in action
          </h2>
          <p className="text-lg text-muted-foreground">
            Here's what your product recommendation widget could look like.
          </p>
        </div>

        {/* Mock widget preview */}
        <div className="mx-auto max-w-lg">
          <div className="relative rounded-2xl border border-border bg-card p-6 shadow-2xl">
            {/* Close button */}
            <button className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <X className="h-5 w-5" />
            </button>

            {/* Widget header */}
            <div className="mb-6 text-center">
              <h3 className="text-xl font-semibold text-foreground">
                You might also like
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on your browsing history
              </p>
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-3 gap-4">
              {sampleProducts.map((product) => (
                <div key={product.id} className="group cursor-pointer text-center">
                  <div className="mb-2 overflow-hidden rounded-lg bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <p className="text-sm font-medium text-foreground line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-sm text-primary">{product.price}</p>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <Button className="mt-6 w-full">View all recommendations</Button>
          </div>
        </div>

        {/* Decorative label */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ↑ This is a live preview • Fully customizable in the builder
        </p>
      </div>
    </section>
  );
};

export default WidgetPreview;
