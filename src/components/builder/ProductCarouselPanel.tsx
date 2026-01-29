import { useState } from "react";
import { ChevronLeft, Pencil, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
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

interface AddedCard {
  id: string;
  title: string;
  isLoading: boolean;
}

interface ProductCarouselPanelProps {
  onBack: () => void;
}

const ProductCarouselPanel = ({ onBack }: ProductCarouselPanelProps) => {
  const [productUrl, setProductUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [addedCards, setAddedCards] = useState<AddedCard[]>([]);

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
    
    const newCardId = Date.now().toString();
    
    // Add loading card
    setAddedCards(prev => [...prev, { id: newCardId, title: "New product", isLoading: true }]);
    setIsCreating(true);
    setProductUrl("");
    
    // Simulate loading (TODO: implement actual URL parsing)
    setTimeout(() => {
      setAddedCards(prev => 
        prev.map(card => 
          card.id === newCardId ? { ...card, isLoading: false } : card
        )
      );
      setIsCreating(false);
    }, 2000);
  };

  const handleDeleteCard = (cardId: string) => {
    setAddedCards(prev => prev.filter(card => card.id !== cardId));
  };

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#fafafa' }}>
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
        <div className="mb-6">
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
              disabled={isCreating || !productUrl.trim()}
              className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90 min-w-[90px]"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </div>

        {/* Added cards section */}
        {addedCards.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">Added cards</h3>
            <div className="space-y-3">
              {addedCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl p-4 shadow-sm transition-shadow hover:shadow-md"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  {card.isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div>
                      {/* Card header with actions */}
                      <div className="flex items-center justify-between mb-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-full gap-1.5 h-7 px-3 text-xs"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleDeleteCard(card.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      {/* Card title */}
                      <p className="font-medium text-foreground text-sm">{card.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Carousel Preview - only show when no cards added */}
        {addedCards.length === 0 && (
          <div className="relative py-6">
            <Carousel
              opts={{
                align: "center",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 3000,
                  stopOnInteraction: false,
                }),
              ]}
              className="w-full max-w-[220px] mx-auto"
            >
              <CarouselContent className="-ml-2">
                {products.map((product) => (
                  <CarouselItem key={product.id} className="pl-2 basis-full">
                    <div className="bg-card rounded-xl overflow-hidden shadow-lg">
                      {/* Product Image */}
                      <div className="aspect-[4/3] relative">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-2.5 bg-card">
                        <p className="text-[10px] text-muted-foreground mb-0.5">
                          {product.price}
                        </p>
                        <h4 className="font-semibold text-foreground text-xs mb-0.5">
                          {product.title}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-full border-border text-[10px] h-7"
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
        )}
      </div>
    </div>
  );
};

export default ProductCarouselPanel;
