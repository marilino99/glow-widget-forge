import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface ProductCard {
  id: string;
  imageUrl: string;
  price: string;
  title: string;
  description: string;
}

interface ProductCarouselPanelProps {
  onBack: () => void;
}

const ProductCarouselPanel = ({ onBack }: ProductCarouselPanelProps) => {
  const [productUrl, setProductUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Demo products for the carousel
  const [products] = useState<ProductCard[]>([
    {
      id: "1",
      imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
      price: "59 USD",
      title: "Nora CBD Skin Treatment",
      description: "Soothe and heal your skin naturally with Nora's CBD ointment.",
    },
    {
      id: "2",
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
      price: "45 USD",
      title: "Derma Moisturizer",
      description: "Deep hydration for all skin types with natural ingredients.",
    },
    {
      id: "3",
      imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=400&fit=crop",
      price: "39 USD",
      title: "Organic Face Serum",
      description: "Rejuvenate your skin with our organic vitamin C serum.",
    },
  ]);

  const handleCreate = () => {
    if (!productUrl.trim()) return;
    setIsLoading(true);
    // TODO: Implement product URL parsing
    setTimeout(() => {
      setIsLoading(false);
      setProductUrl("");
    }, 1000);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-xl font-bold">Product carousel</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Description */}
        <p className="text-muted-foreground mb-6">
          Generate more open rates on your products and close more sales by promoting your special offers and hot drops in a beautiful way!
        </p>

        {/* Create card from link */}
        <div className="mb-8">
          <h3 className="font-semibold text-foreground mb-3">Create card from link</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Paste product URL"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              className="flex-1 rounded-full bg-muted border-0"
            />
            <Button
              onClick={handleCreate}
              disabled={isLoading || !productUrl.trim()}
              className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90"
            >
              {isLoading ? "Loading..." : "Create"}
            </Button>
          </div>
        </div>

        {/* Product Carousel Preview */}
        <div className="relative">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-2 basis-[85%]">
                  <div className="bg-card rounded-2xl overflow-hidden shadow-lg">
                    {/* Product Image */}
                    <div className="aspect-square relative">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4 bg-card">
                      <p className="text-sm text-muted-foreground mb-1">
                        {product.price}
                      </p>
                      <h4 className="font-semibold text-foreground mb-1">
                        {product.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {product.description}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full rounded-full border-border"
                      >
                        Show
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default ProductCarouselPanel;
