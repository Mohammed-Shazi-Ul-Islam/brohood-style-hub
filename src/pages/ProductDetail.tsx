import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingCart, Truck, RefreshCcw, Shield, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/ProductCard";
import productTshirt from "@/assets/product-tshirt-1.jpg";
import productJeans from "@/assets/product-jeans-1.jpg";
import productShirt from "@/assets/product-shirt-1.jpg";
import productHoodie from "@/assets/product-hoodie-1.jpg";

// Mock product data
const product = {
  id: "1",
  name: "Premium Black T-Shirt",
  description: "Crafted from 100% premium cotton, this classic black t-shirt is a wardrobe essential. Features a regular fit with reinforced stitching for lasting durability.",
  price: 999,
  originalPrice: 1499,
  discount: 33,
  rating: 4.5,
  reviewCount: 128,
  category: "T-Shirts",
  images: [productTshirt, productTshirt, productTshirt, productTshirt],
  sizes: ["S", "M", "L", "XL", "XXL"],
  colors: [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Navy", value: "#000080" },
  ],
  stock: 45,
};

const relatedProducts = [
  {
    id: "2",
    name: "Classic Blue Denim Jeans",
    image: productJeans,
    price: 2499,
    originalPrice: 3499,
    discount: 29,
    rating: 4.7,
    category: "Jeans",
  },
  {
    id: "3",
    name: "Elegant White Casual Shirt",
    image: productShirt,
    price: 1799,
    originalPrice: 2299,
    discount: 22,
    rating: 4.6,
    category: "Shirts",
  },
  {
    id: "4",
    name: "Modern Black Hoodie",
    image: productHoodie,
    price: 1999,
    originalPrice: 2999,
    discount: 33,
    rating: 4.8,
    category: "Hoodies",
  },
];

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(product.images[0]);

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/products" className="hover:text-primary">Products</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.discount && (
                <Badge
                  variant="destructive"
                  className="absolute top-4 left-4"
                >
                  {product.discount}% OFF
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setMainImage(image)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    mainImage === image
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-semibold">{product.rating}</span>
                  <span className="text-muted-foreground">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
                <Badge variant="outline">{product.category}</Badge>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">₹{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.originalPrice}
                  </span>
                  <Badge className="bg-primary text-primary-foreground">
                    Save ₹{product.originalPrice - product.price}
                  </Badge>
                </>
              )}
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold">Color: {selectedColor.name}</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor.name === color.name
                        ? "border-primary scale-110"
                        : "border-border hover:border-primary/50"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Select Size</h3>
                <Button variant="link" size="sm" className="text-primary">
                  Size Guide
                </Button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className="h-12"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="font-semibold">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
                <span className="text-sm text-muted-foreground">
                  ({product.stock} available)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button size="lg" className="flex-1" variant="premium">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            <Button size="lg" variant="secondary" className="w-full">
              Buy Now
            </Button>

            {/* Features */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Free Delivery</h4>
                  <p className="text-sm text-muted-foreground">
                    On orders above ₹999
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCcw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">7 Days Return</h4>
                  <p className="text-sm text-muted-foreground">
                    Easy return & exchange policy
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Secure Payment</h4>
                  <p className="text-sm text-muted-foreground">
                    100% secure transactions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Size & Fit
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Reviews ({product.reviewCount})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="py-6">
              <div className="prose max-w-none">
                <p>{product.description}</p>
                <h3 className="font-semibold mt-4 mb-2">Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>100% Premium Cotton</li>
                  <li>Regular Fit</li>
                  <li>Pre-shrunk fabric</li>
                  <li>Reinforced stitching</li>
                  <li>Machine washable</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="details" className="py-6">
              <p className="text-muted-foreground mb-4">
                Model is 6'0" and wearing size M
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Size Guide</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Size</th>
                        <th className="text-left py-2">Chest (in)</th>
                        <th className="text-left py-2">Length (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">S</td>
                        <td>36-38</td>
                        <td>27</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">M</td>
                        <td>38-40</td>
                        <td>28</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">L</td>
                        <td>40-42</td>
                        <td>29</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">XL</td>
                        <td>42-44</td>
                        <td>30</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="py-6">
              <div className="space-y-6">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">{product.rating}</div>
                    <div className="flex items-center gap-1 justify-center mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 fill-primary text-primary"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {product.reviewCount} reviews
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                  <Button>Write a Review</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
