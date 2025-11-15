import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, ShoppingBag, Package, CreditCard, Shirt, HelpCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
  products?: any[];
  orders?: any[];
}

const quickActions = [
  { icon: ShoppingBag, label: 'Find Products', query: 'Help me find products' },
  { icon: Package, label: 'Track Order', query: 'Track my order' },
  { icon: CreditCard, label: 'Payment Info', query: 'What payment methods do you accept?' },
  { icon: Shirt, label: 'Style Advice', query: 'Help me choose an outfit' },
  { icon: HelpCircle, label: 'Support', query: 'I need help with my order' },
];

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(
        "👋 Hi! I'm BroHood's AI fashion assistant. I can help you with:\n\n🛍️ Finding the perfect products\n👔 Style advice & outfit combinations\n📦 Order tracking\n💳 Payment information\n🆘 Customer support\n🏪 Store information\n\nWhat can I help you with today?",
        ['Find products', 'Style advice', 'Track order', 'Payment options']
      );
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const addBotMessage = (text: string, suggestions?: string[], products?: any[], orders?: any[]) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      suggestions,
      products,
      orders,
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const addUserMessage = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userQuery = input.trim();
    setInput('');
    addUserMessage(userQuery);
    setIsTyping(true);

    try {
      const response = await generateAIResponse(userQuery);
      setIsTyping(false);
      addBotMessage(response.text, response.suggestions, response.products, response.orders);
    } catch (error) {
      console.error('AI Error:', error);
      setIsTyping(false);
      addBotMessage(
        "I apologize, I'm having trouble processing that. Let me help you with:\n\n🛍️ Finding products\n👔 Style advice\n📦 Order tracking\n💳 Payment info\n🆘 Customer support",
        ['Find products', 'Style advice', 'Track order']
      );
    }
  };

  const generateAIResponse = async (query: string): Promise<{ text: string; suggestions?: string[]; products?: any[]; orders?: any[] }> => {
    const lowerQuery = query.toLowerCase();
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // 1. Check if asking about ORDERS - fetch from database
    if (lowerQuery.includes('order') || lowerQuery.includes('track') || lowerQuery.includes('delivery') || lowerQuery.includes('shipping')) {
      return await handleOrderQuery(userId);
    }

    // 2. Check if FINDING PRODUCTS - fetch from database
    if (lowerQuery.includes('show') || lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('looking for')) {
      return await handleProductSearch(query, lowerQuery);
    }

    // 3. Check if PAYMENT/SUPPORT queries - predefined responses
    if (lowerQuery.includes('payment') || lowerQuery.includes('pay') || lowerQuery.includes('cod') || lowerQuery.includes('upi')) {
      return {
        text: "💳 Payment Methods We Accept:\n\n✅ Available:\n• UPI (Google Pay, PhonePe, Paytm)\n• Credit/Debit Cards\n• Net Banking\n• Wallets\n• Cash on Delivery (COD)\n\n🎁 Offers:\n• FIRST10 - 10% off first order\n• FREE999 - Free shipping on ₹999+\n\n💡 EMI available on orders ₹3000+",
        suggestions: ['Current offers', 'COD info', 'UPI payment', 'Browse products']
      };
    }

    if (lowerQuery.includes('return') || lowerQuery.includes('exchange') || lowerQuery.includes('refund')) {
      return {
        text: "🔄 Return & Exchange Policy:\n\n✅ Easy Returns:\n• 7-day return window\n• Free return pickup\n• Full refund or exchange\n\n📋 Conditions:\n• Unused with tags\n• Original packaging\n\n🆘 Need help? Contact: support@brohood.com",
        suggestions: ['Contact support', 'Track order', 'Browse products']
      };
    }

    if (lowerQuery.includes('store') || lowerQuery.includes('contact') || lowerQuery.includes('location')) {
      return {
        text: "🏪 BroHood Store:\n\n📍 Store: BROHOOD\n📍 Address: [To be updated]\n⏰ Timing: [To be updated]\n\n📞 Contact:\n• Email: support@brohood.com\n• Phone: [To be updated]\n\n💡 Shop online 24/7!",
        suggestions: ['Browse products', 'Contact us', 'Shipping info']
      };
    }

    if (lowerQuery.includes('size') || lowerQuery.includes('fit') || lowerQuery.includes('measurement')) {
      return {
        text: "📏 Size Guide:\n\n👕 Shirts/T-Shirts:\n• S: 5'4\"-5'7\", Chest 36-38\", Weight 50-60kg\n• M: 5'7\"-5'10\", Chest 38-40\", Weight 60-70kg\n• L: 5'10\"-6'1\", Chest 40-42\", Weight 70-80kg\n• XL: 6'1\"+, Chest 42-44\", Weight 80kg+\n\n👖 Jeans: Waist size in inches (28-38)\n\n💡 Check product page for specific measurements!",
        suggestions: ['Find products', 'Style advice', 'Browse all']
      };
    }

    // 4. For STYLE ADVICE - Use Gemini AI
    if (lowerQuery.includes('style') || lowerQuery.includes('outfit') || lowerQuery.includes('wear') || 
        lowerQuery.includes('match') || lowerQuery.includes('party') || lowerQuery.includes('wedding') ||
        lowerQuery.includes('beach') || lowerQuery.includes('casual') || lowerQuery.includes('formal') ||
        lowerQuery.includes('gift') || lowerQuery.includes('occasion') || lowerQuery.includes('look')) {
      return await getGeminiResponse(query, userId, lowerQuery);
    }

    // 5. Default - Use Gemini for anything else
    return await getGeminiResponse(query, userId, lowerQuery);
  };

  const handleOrderQuery = async (userId?: string) => {
    if (!userId) {
      return {
        text: "📦 To track your orders, please log in first!\n\nOnce logged in, I can show you:\n• All your orders\n• Order status\n• Tracking information\n• Delivery estimates",
        suggestions: ['Log in', 'Browse products', 'Continue shopping']
      };
    }

    try {
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(name, images:product_images(image_url))
          )
        `)
        .eq('customer_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (orders && orders.length > 0) {
        return {
          text: `📦 Here are your recent orders:\n\nI found ${orders.length} order(s). Click on any order below for details!`,
          orders: orders,
          suggestions: ['Order details', 'Return/Exchange', 'Contact support']
        };
      } else {
        return {
          text: "📦 You don't have any orders yet!\n\n🛍️ Ready to shop? Browse our collection!\n\n✨ First order? Get 10% off with code: FIRST10",
          suggestions: ['Browse products', 'New arrivals', 'Best sellers']
        };
      }
    } catch (error) {
      return {
        text: "📦 Having trouble fetching your orders. Please visit your Account page or contact support!",
        suggestions: ['Go to account', 'Contact support']
      };
    }
  };

  const handleProductSearch = async (query: string, lowerQuery: string) => {
    // Extract price if mentioned
    let maxPrice = 10000;
    const priceMatch = lowerQuery.match(/under\s*₹?(\d+)/i) || lowerQuery.match(/below\s*₹?(\d+)/i);
    if (priceMatch) {
      maxPrice = parseInt(priceMatch[1]);
    }

    // Determine category
    let categorySlug = '';
    if (lowerQuery.includes('hoodie')) categorySlug = 'mens-hoodies';
    else if (lowerQuery.includes('shirt') && !lowerQuery.includes('t-shirt')) categorySlug = 'mens-shirts';
    else if (lowerQuery.includes('t-shirt') || lowerQuery.includes('tshirt')) categorySlug = 'mens-tshirts';
    else if (lowerQuery.includes('jeans')) categorySlug = 'mens-jeans';
    else if (lowerQuery.includes('trouser')) categorySlug = 'mens-trousers';
    else if (lowerQuery.includes('jacket')) categorySlug = 'mens-jackets';
    else if (lowerQuery.includes('sneaker')) categorySlug = 'mens-sneakers';

    if (categorySlug) {
      try {
        const { data: category } = await (supabase.from('categories') as any)
          .select('id')
          .eq('slug', categorySlug)
          .single();

        if (category) {
          let productQuery = (supabase.from('products') as any)
            .select(`*, images:product_images(image_url, is_primary), category:categories(name)`)
            .eq('category_id', category.id)
            .eq('status', 'active')
            .lte('price', maxPrice)
            .order('created_at', { ascending: false })
            .limit(6);

          // Color filter
          if (lowerQuery.includes('black')) productQuery = productQuery.ilike('name', '%black%');
          else if (lowerQuery.includes('white')) productQuery = productQuery.ilike('name', '%white%');
          else if (lowerQuery.includes('blue')) productQuery = productQuery.ilike('name', '%blue%');

          const { data: products } = await productQuery;

          if (products && products.length > 0) {
            return {
              text: `🔍 Found ${products.length} products for you${maxPrice < 10000 ? ` under ₹${maxPrice}` : ''}!\n\nHere are some great options:`,
              products: products,
              suggestions: ['Show more', 'Different category', 'Style advice']
            };
          }
        }
      } catch (error) {
        console.error('Product search error:', error);
      }
    }

    return {
      text: "🛍️ I'd love to help you find products! What are you looking for?\n\nOur categories:\n• Shirts & T-Shirts\n• Jeans & Trousers\n• Hoodies & Sweaters\n• Jackets\n• Sneakers & Footwear\n• Accessories",
      suggestions: ['Show shirts', 'Show jeans', 'Show hoodies', 'Style advice']
    };
  };

  const getGeminiResponse = async (query: string, userId?: string, lowerQuery?: string) => {
    try {
      // Check if API key is loaded
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.error('❌ Gemini API key not found! Please restart dev server.');
        throw new Error('API key not configured');
      }
      console.log('✅ Gemini API key loaded, calling AI...');
      
      const lower = lowerQuery || query.toLowerCase();
      
      // Check if asking about orders
      if (lower.includes('order') || lower.includes('track') || lower.includes('delivery')) {
        const orderResult = await handleOrderQuery(userId);
        if (orderResult.orders || !userId) {
          return orderResult;
        }
      }

      // Fetch products for context
      const { data: allProducts } = await (supabase.from('products') as any)
        .select('name, price, slug, category:categories(name, slug)')
        .eq('status', 'active')
        .limit(20);

      const productContext = allProducts?.map((p: any) => 
        `${p.name} (₹${p.price}) in ${p.category?.name}`
      ).join(', ') || '';

      // Build comprehensive system prompt
      const systemPrompt = `You are BroHood's AI fashion assistant for men's fashion.

STRICT RULES:
1. ONLY answer men's fashion, BroHood products, orders, payments, support, store info
2. OFF-TOPIC (weather, politics, etc) → Say: "I'm BroHood's fashion assistant! I can only help with men's fashion. What can I help you with?"

FOR STYLE ADVICE:
- Suggest 2-3 complete outfit combinations
- Explain WHY each works
- Mention specific items (black jeans, white shirt, etc)
- Give color tips
Example: "For a party: 1) Fitted shirt + dark jeans + sneakers (Why: Clean & stylish) 2) Polo + chinos + loafers (Why: Smart casual)"

FOR PRODUCTS:
- Recommend categories
- Suggest price ranges
- Mention we have: shirts, jeans, hoodies, jackets, sneakers, accessories

SIZE GUIDE:
S: 5'4"-5'7", M: 5'7"-5'10", L: 5'10"-6'1", XL: 6'1"+

STORE INFO:
- Payment: UPI, Cards, COD, Wallets
- Shipping: Free on ₹999+
- Returns: 7-day policy
- Support: support@brohood.com
- Offers: FIRST10 (10% off), FREE999 (free shipping)

Products available: ${productContext}

Keep responses 2-3 paragraphs, friendly, sales-focused.`;

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 400,
        }
      });
      
      console.log('🤖 Calling Gemini AI with query:', query);
      
      const prompt = `${systemPrompt}\n\n---\n\nCustomer asks: "${query}"\n\nYour response:`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();
      
      console.log('✅ Gemini AI response received:', aiText.substring(0, 100) + '...');

      // Update conversation history
      setConversationHistory(prev => [
        ...prev.slice(-6), // Keep last 3 exchanges
        { role: 'user', parts: [{ text: query }] },
        { role: 'model', parts: [{ text: aiText }] }
      ]);

      // Try to fetch relevant products if AI mentions categories
      let products: any[] = [];
      if (lower.includes('hoodie') || aiText.toLowerCase().includes('hoodie')) {
        products = await fetchProductsByCategory('mens-hoodies', 4);
      } else if (lower.includes('shirt') && !lower.includes('t-shirt')) {
        products = await fetchProductsByCategory('mens-shirts', 4);
      } else if (lower.includes('jeans')) {
        products = await fetchProductsByCategory('mens-jeans', 4);
      } else if (lower.includes('jacket')) {
        products = await fetchProductsByCategory('mens-jackets', 4);
      } else if (lower.includes('party') || lower.includes('wedding') || lower.includes('formal')) {
        // For occasions, show mix of products
        const shirts = await fetchProductsByCategory('mens-shirts', 2);
        const jeans = await fetchProductsByCategory('mens-jeans', 2);
        products = [...shirts, ...jeans];
      }

      // Smart suggestions
      let suggestions: string[] = [];
      if (aiText.toLowerCase().includes('style') || aiText.toLowerCase().includes('outfit')) {
        suggestions = ['Show products', 'More occasions', 'Size guide', 'Browse all'];
      } else if (products.length > 0) {
        suggestions = ['Show more', 'Different style', 'Size guide', 'Add to cart'];
      } else {
        suggestions = ['Find products', 'Style advice', 'Track order', 'Offers'];
      }

      return {
        text: aiText,
        products: products.length > 0 ? products : undefined,
        suggestions: suggestions
      };

    } catch (error: any) {
      console.error('❌ Gemini AI Error:', error);
      console.error('Error details:', error.message);
      console.error('Full error:', JSON.stringify(error, null, 2));
      
      // If API key issue, show specific message
      if (error.message?.includes('API key') || error.message?.includes('API_KEY')) {
        return {
          text: "⚠️ AI is not configured yet. Please restart the dev server!\n\nIn the meantime, I can still help you with:\n\n🛍️ Finding products\n👔 Style advice\n📦 Order tracking\n💳 Payments\n🆘 Support",
          suggestions: ['Find products', 'Style advice', 'Track order', 'Payment info']
        };
      }
      
      return {
        text: "I'm here to help with men's fashion! Ask me about:\n\n🛍️ Finding products\n👔 Style combinations\n📦 Order tracking\n💳 Payments\n🆘 Support\n\nWhat would you like to know?",
        suggestions: ['Find products', 'Style advice', 'Track order', 'Payment info']
      };
    }
  };

  const fetchProductsByCategory = async (categorySlug: string, limit: number = 4) => {
    try {
      const { data: category } = await (supabase.from('categories') as any)
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (category) {
        const { data: products } = await (supabase.from('products') as any)
          .select(`*, images:product_images(image_url, is_primary), category:categories(name)`)
          .eq('category_id', category.id)
          .eq('status', 'active')
          .limit(limit);

        return products || [];
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    return [];
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  const handleQuickAction = (query: string) => {
    setInput(query);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg bg-black hover:bg-gray-800 z-50"
          size="icon"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] md:w-[420px] h-[calc(100vh-2rem)] sm:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-black text-white p-3 sm:p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">BroHood AI Assistant</h3>
                <p className="text-xs text-gray-300">Powered by Gemini AI</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="p-2 sm:p-3 border-b bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.query)}
                    className="text-xs h-7 sm:h-8 px-2 sm:px-3"
                  >
                    <action.icon className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">{action.label}</span>
                    <span className="sm:hidden">{action.label.split(' ')[0]}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollRef}>
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[85%] space-y-2">
                    <div
                      className={`rounded-2xl px-3 py-2 sm:px-4 ${
                        message.sender === 'user'
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-xs sm:text-sm whitespace-pre-line">{message.text}</p>
                    </div>

                    {/* Product Cards */}
                    {message.products && message.products.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {message.products.map((product: any) => (
                          <Link
                            key={product.id}
                            to={`/product/${product.slug}`}
                            className="bg-white border rounded-lg p-2 hover:shadow-md transition-shadow"
                            onClick={() => setIsOpen(false)}
                          >
                            <img
                              src={product.images?.[0]?.image_url || '/placeholder.jpg'}
                              alt={product.name}
                              className="w-full h-20 sm:h-24 object-cover rounded mb-2"
                            />
                            <p className="text-xs font-medium line-clamp-2">{product.name}</p>
                            <p className="text-sm font-bold text-black mt-1">₹{product.price}</p>
                            <Button size="sm" className="w-full mt-2 h-6 sm:h-7 text-xs">
                              View
                            </Button>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Order Cards */}
                    {message.orders && message.orders.length > 0 && (
                      <div className="space-y-2">
                        {message.orders.map((order: any) => (
                          <Card key={order.id} className="p-2 sm:p-3 bg-white">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-xs font-semibold">#{order.order_number}</p>
                                <p className="text-xs text-gray-600">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="text-xs">
                                {order.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {order.items?.[0]?.product?.images?.[0] && (
                                <img
                                  src={order.items[0].product.images[0].image_url}
                                  alt="Product"
                                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-xs">{order.items?.length} item(s)</p>
                                <p className="text-sm font-bold">₹{order.total_amount}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="cursor-pointer hover:bg-gray-200 text-xs px-2 py-1"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 text-sm"
                disabled={isTyping}
              />
              <Button type="submit" size="icon" disabled={isTyping || !input.trim()} className="h-9 w-9 sm:h-10 sm:w-10">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by Google Gemini AI
            </p>
          </div>
        </div>
      )}
    </>
  );
}
