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
        "👋 Hey! I'm BroHood's AI Assistant!\n\nI'm here to help you 24/7 with:\n\n🛍️ Product Search & Recommendations\n👔 Style Advice & Outfit Ideas\n📦 Order Tracking & Status\n🔄 Returns, Exchanges & Refunds\n💳 Payment Methods & Issues\n🚚 Shipping & Delivery Info\n📏 Size Guide & Fit Help\n🆘 Customer Support & Complaints\n🎁 Offers & Discounts\n\n💡 Just ask me anything!\n\nExamples:\n• \"Show me black hoodies under ₹2000\"\n• \"Track my order\"\n• \"How do I return an item?\"\n• \"What size should I get?\"\n• \"Style advice for a party\"\n\nWhat can I help you with? 😊",
        ['Find products', 'Track order', 'Return policy', 'Style advice']
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
    if (lowerQuery.includes('order') || lowerQuery.includes('track') || lowerQuery.includes('delivery') || 
        lowerQuery.includes('shipping') || lowerQuery.includes('cancel') || lowerQuery.includes('refund') ||
        lowerQuery.includes('return') || lowerQuery.includes('exchange') || lowerQuery.includes('money back') ||
        lowerQuery.includes('not received') || lowerQuery.includes('delay') || lowerQuery.includes('late')) {
      return await handleOrderQuery(userId, query);
    }

    // 2. Handle SHIPPING queries
    if (lowerQuery.includes('shipping') || lowerQuery.includes('delivery time') || lowerQuery.includes('how long') ||
        lowerQuery.includes('when will') || lowerQuery.includes('delivery charge')) {
      return {
        text: "🚚 Shipping & Delivery Information:\n\n📦 DELIVERY TIME:\n• Metro Cities: 3-5 business days\n• Other Cities: 5-7 business days\n• Remote Areas: 7-10 business days\n\n💰 SHIPPING CHARGES:\n• FREE on orders ₹999+\n• ₹99 on orders below ₹999\n• COD: Additional ₹50\n\n🚀 EXPRESS DELIVERY:\n• Available in select cities\n• 1-2 business days\n• ₹199 extra charge\n\n📍 TRACKING:\n• SMS & Email updates\n• Real-time tracking link\n• Delivery partner details\n\n📅 ORDER PROCESSING:\n• Orders placed before 2 PM: Same day dispatch\n• After 2 PM: Next day dispatch\n• Sundays & holidays: Next working day\n\n🎁 GIFT WRAPPING:\n• Available at checkout\n• ₹49 per item\n• Includes greeting card\n\n❓ DELIVERY ISSUES?\n• Wrong address: Update before dispatch\n• Not available: We'll call you\n• Delayed: Contact support\n\n💡 Track your order anytime!\nJust ask: \"Track my order\"",
        suggestions: ['Track order', 'Free shipping', 'Express delivery', 'Browse products']
      };
    }

    // 3. Handle QUALITY/DEFECT issues
    if (lowerQuery.includes('defect') || lowerQuery.includes('damage') || lowerQuery.includes('quality') ||
        lowerQuery.includes('broken') || lowerQuery.includes('torn') || lowerQuery.includes('wrong item') ||
        lowerQuery.includes('different') || lowerQuery.includes('not as shown')) {
      return {
        text: "🛡️ Quality Issue / Wrong Item:\n\nWe sincerely apologize! 😔\n\n✅ IMMEDIATE RESOLUTION:\n\n1️⃣ WRONG ITEM RECEIVED:\n• Full refund or replacement\n• Free return pickup\n• Priority processing\n\n2️⃣ DEFECTIVE/DAMAGED:\n• Replacement guaranteed\n• No questions asked\n• Free pickup & delivery\n\n3️⃣ QUALITY ISSUES:\n• Full refund available\n• Exchange for better piece\n• Quality check on new item\n\n📸 WHAT TO DO:\n1. Take clear photos/video\n2. Email: support@brohood.com\n3. Include order number\n4. Describe the issue\n\n⚡ QUICK PROCESS:\n• Response: Within 4 hours\n• Pickup: Within 24 hours\n• Refund/Replacement: 3-5 days\n\n💰 REFUND OPTIONS:\n• Original payment method\n• Store credit (instant)\n• Exchange for any item\n\n🎁 COMPENSATION:\n• 10% discount on next order\n• Free shipping on replacement\n• Priority customer service\n\n📞 URGENT?\nCall: [Your number]\nEmail: support@brohood.com\n\nWe'll make it right! 💪",
        suggestions: ['Contact support', 'Email support', 'Refund policy', 'Track order']
      };
    }

    // 4. Handle COMPLAINTS
    if (lowerQuery.includes('complaint') || lowerQuery.includes('unhappy') || lowerQuery.includes('disappointed') ||
        lowerQuery.includes('bad service') || lowerQuery.includes('poor') || lowerQuery.includes('terrible')) {
      return {
        text: "🙏 We're Sorry to Hear That!\n\nYour satisfaction is our priority. Let's fix this!\n\n📝 REGISTER COMPLAINT:\n\n1️⃣ Email us:\nsupport@brohood.com\n• Include order number\n• Describe the issue\n• Attach photos if needed\n\n2️⃣ Call us:\n[Your phone number]\n• Speak to our team\n• Immediate assistance\n\n3️⃣ Chat with me:\n• Tell me your issue\n• I'll escalate immediately\n\n⚡ RESOLUTION TIME:\n• Acknowledgment: 2 hours\n• Investigation: 24 hours\n• Resolution: 48-72 hours\n\n💰 COMPENSATION:\nDepending on issue:\n• Full refund\n• Replacement\n• Store credit\n• Discount on next order\n\n🎯 COMMON ISSUES WE SOLVE:\n• Delivery delays\n• Product quality\n• Wrong items\n• Payment problems\n• Customer service\n\n📊 ESCALATION:\nNot satisfied with resolution?\n• Manager review available\n• Priority handling\n• Direct communication\n\n💡 We value your feedback!\nHelps us improve our service.\n\nHow can I help you right now?",
        suggestions: ['Contact support', 'Track order', 'Refund policy', 'Quality issue']
      };
    }

    // 5. Check if FINDING PRODUCTS - fetch from database
    if (lowerQuery.includes('show') || lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('looking for')) {
      return await handleProductSearch(query, lowerQuery);
    }

    // 3. Handle OFFERS/DISCOUNTS
    if (lowerQuery.includes('offer') || lowerQuery.includes('discount') || lowerQuery.includes('coupon') ||
        lowerQuery.includes('promo') || lowerQuery.includes('deal') || lowerQuery.includes('sale')) {
      return {
        text: "🎁 Current Offers & Discounts:\n\n🔥 ACTIVE DEALS:\n\n1️⃣ FIRST10\n• 10% OFF on first order\n• Min order: ₹999\n• Valid for new customers\n\n2️⃣ FREE999\n• FREE SHIPPING\n• On orders ₹999+\n• All India delivery\n\n3️⃣ SAVE500\n• ₹500 OFF\n• On orders ₹2999+\n• All products\n\n4️⃣ FLAT20\n• 20% OFF\n• On orders ₹1999+\n• Limited time\n\n💳 BANK OFFERS:\n• HDFC: 10% instant discount\n• ICICI: 15% on EMI\n• SBI: ₹200 cashback\n• Axis: No cost EMI\n\n🎯 CATEGORY DEALS:\n• Shirts: Buy 2 Get 1 Free\n• Jeans: Flat 30% OFF\n• Hoodies: Up to 40% OFF\n• Sneakers: Buy 1 Get 1 at 50%\n\n📅 UPCOMING SALES:\n• Weekend Sale: Every Sat-Sun\n• Flash Sale: Every Wed 12-6 PM\n• Festive Sale: [Dates]\n\n💡 HOW TO USE:\n1. Add items to cart\n2. Enter code at checkout\n3. Discount applied automatically\n\n🔔 WANT MORE DEALS?\n• Subscribe to newsletter\n• Follow us on Instagram\n• Enable notifications\n\n⚠️ TERMS:\n• One code per order\n• Cannot combine offers\n• Check expiry dates\n• Some exclusions apply\n\n🛍️ Start shopping now!",
        suggestions: ['Browse products', 'New arrivals', 'Best sellers', 'Payment methods']
      };
    }

    // 4. Check if PAYMENT/SUPPORT queries - predefined responses
    if (lowerQuery.includes('payment method') || lowerQuery.includes('how to pay') || lowerQuery.includes('cod') || 
        lowerQuery.includes('upi') || lowerQuery.includes('card') || lowerQuery.includes('wallet')) {
      return {
        text: "💳 Payment Methods & Information:\n\n✅ WE ACCEPT:\n\n💰 UPI:\n• Google Pay, PhonePe, Paytm\n• BHIM, Amazon Pay\n• Instant confirmation\n\n💳 CARDS:\n• Visa, Mastercard, RuPay\n• Credit & Debit cards\n• Secure 3D authentication\n\n🏦 NET BANKING:\n• All major banks\n• Instant payment\n\n👛 WALLETS:\n• Paytm, PhonePe, Mobikwik\n• Amazon Pay, Freecharge\n\n💵 CASH ON DELIVERY (COD):\n• Available on orders under ₹5000\n• ₹50 COD charges apply\n• Pay cash to delivery person\n\n💡 EMI OPTIONS:\n• Available on orders ₹3000+\n• 3, 6, 9, 12 months\n• No cost EMI on select cards\n\n🎁 CURRENT OFFERS:\n• FIRST10 - 10% off first order\n• FREE999 - Free shipping on ₹999+\n• SAVE500 - ₹500 off on ₹2999+\n\n🔒 SECURITY:\n• SSL encrypted payments\n• PCI DSS compliant\n• Razorpay secure gateway\n• No card details stored\n\n❓ PAYMENT FAILED?\n• Check bank balance\n• Verify OTP/PIN\n• Try different method\n• Contact: support@brohood.com\n\n💰 REFUNDS:\n• Original payment method\n• 5-7 business days\n• Instant for UPI (1-3 days)",
        suggestions: ['Current offers', 'COD charges', 'EMI options', 'Browse products']
      };
    }

    if (lowerQuery.includes('return policy') || lowerQuery.includes('exchange policy') || lowerQuery.includes('refund policy')) {
      return {
        text: "🔄 Return, Exchange & Refund Policy:\n\n✅ RETURNS (7 Days):\n• Free return pickup 🚚\n• Full refund to original payment method\n• Processed within 5-7 business days\n\n🔄 EXCHANGES (7 Days):\n• Size/color exchange available\n• Free pickup & delivery\n• Subject to stock availability\n\n💰 REFUNDS:\n• Cancelled orders: Immediate\n• Returns: 5-7 business days\n• Failed payments: 3-5 business days\n\n📋 CONDITIONS:\n• Unused with original tags ✅\n• Original packaging intact ✅\n• No damage or alterations ✅\n• Invoice/receipt required ✅\n\n❌ NON-RETURNABLE:\n• Innerwear & socks\n• Customized items\n• Sale items (final sale)\n\n🆘 Questions?\nEmail: support@brohood.com\nPhone: [Your number]\n\n💡 We're here to help!",
        suggestions: ['Track my order', 'Contact support', 'Browse products', 'Size guide']
      };
    }

    if (lowerQuery.includes('store') || lowerQuery.includes('contact') || lowerQuery.includes('location') || 
        lowerQuery.includes('support') || lowerQuery.includes('help') || lowerQuery.includes('customer service')) {
      return {
        text: "🏪 BroHood - Contact & Support:\n\n📧 EMAIL:\nsupport@brohood.com\n(Response within 24 hours)\n\n📞 PHONE:\n[Your phone number]\n(Mon-Sat: 10 AM - 7 PM)\n\n💬 LIVE CHAT:\nRight here! I'm available 24/7\n\n📍 STORE ADDRESS:\n[Your store address]\n[City, State - PIN]\n\n⏰ STORE HOURS:\nMon-Sat: 10 AM - 8 PM\nSunday: 11 AM - 6 PM\n\n🌐 ONLINE:\nShop 24/7 at brohood.com\n\n📱 SOCIAL MEDIA:\nInstagram: @brohood\nFacebook: /brohood\n\n🆘 URGENT ISSUES?\n• Order problems\n• Payment issues\n• Delivery delays\n→ Email us immediately!\n\n💡 I can help you right now with:\n• Order tracking\n• Product search\n• Returns/refunds\n• Style advice\n\nWhat do you need help with?",
        suggestions: ['Track order', 'Return policy', 'Browse products', 'Payment info']
      };
    }

    if (lowerQuery.includes('size') || lowerQuery.includes('fit') || lowerQuery.includes('measurement') || 
        lowerQuery.includes('sizing') || lowerQuery.includes('what size')) {
      return {
        text: "📏 Complete Size Guide:\n\n👕 SHIRTS & T-SHIRTS:\n\nS (Small):\n• Height: 5'4\" - 5'7\"\n• Chest: 36-38 inches\n• Weight: 50-60 kg\n• Shoulder: 16-17 inches\n\nM (Medium):\n• Height: 5'7\" - 5'10\"\n• Chest: 38-40 inches\n• Weight: 60-70 kg\n• Shoulder: 17-18 inches\n\nL (Large):\n• Height: 5'10\" - 6'1\"\n• Chest: 40-42 inches\n• Weight: 70-80 kg\n• Shoulder: 18-19 inches\n\nXL (Extra Large):\n• Height: 6'1\" - 6'3\"\n• Chest: 42-44 inches\n• Weight: 80-90 kg\n• Shoulder: 19-20 inches\n\nXXL:\n• Height: 6'3\"+\n• Chest: 44-46 inches\n• Weight: 90+ kg\n• Shoulder: 20-21 inches\n\n👖 JEANS & TROUSERS:\n• Waist size in inches: 28-38\n• Length: Regular (32\"), Long (34\")\n\n🧥 JACKETS & HOODIES:\n• Same as shirts (S-XXL)\n• Relaxed fit for layering\n\n👟 FOOTWEAR:\n• UK sizes: 6-11\n• US sizes: 7-12\n• EU sizes: 40-45\n\n💡 FIT TYPES:\n• Slim Fit: Fitted, modern cut\n• Regular Fit: Classic, comfortable\n• Relaxed Fit: Loose, casual\n\n📐 HOW TO MEASURE:\n1. Chest: Around fullest part\n2. Waist: Around natural waistline\n3. Shoulder: Across back, seam to seam\n4. Length: From shoulder to hem\n\n🔄 WRONG SIZE?\n• Free exchange within 7 days\n• Size up/down available\n• Check product page for exact measurements\n\n❓ STILL CONFUSED?\nAsk me: \"What size for 5'9\" and 70kg?\"\nI'll recommend the perfect fit!",
        suggestions: ['Find products', 'Exchange policy', 'Style advice', 'Browse all']
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

  const handleOrderQuery = async (userId?: string, query?: string) => {
    const lowerQuery = query?.toLowerCase() || '';

    if (!userId) {
      return {
        text: "📦 To track your orders, please log in first!\n\nOnce logged in, I can help you with:\n• Order tracking & status\n• Delivery estimates\n• Order cancellation\n• Returns & refunds\n• Payment issues\n\n👉 Please log in to continue!",
        suggestions: ['Log in', 'Browse products', 'Return policy', 'Payment info']
      };
    }

    try {
      const { data: orders } = await (supabase
        .from('orders') as any)
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

      if (!orders || orders.length === 0) {
        return {
          text: "📦 You don't have any orders yet!\n\n🛍️ Ready to start shopping?\n\n✨ Special Offers:\n• FIRST10 - 10% off your first order\n• FREE999 - Free shipping on orders ₹999+\n\n💡 Browse our latest collection now!",
          suggestions: ['Browse products', 'New arrivals', 'Best sellers', 'Offers']
        };
      }

      // Check for specific order queries
      const latestOrder = orders[0];
      const orderAge = Math.floor((Date.now() - new Date(latestOrder.created_at).getTime()) / (1000 * 60 * 60 * 24));

      // Handle specific queries about orders
      if (lowerQuery.includes('cancel')) {
        if (latestOrder.status === 'pending' || latestOrder.status === 'confirmed') {
          return {
            text: `🚫 Order Cancellation:\n\nYour latest order #${latestOrder.order_number} can be cancelled!\n\n✅ Status: ${latestOrder.status}\n💰 Amount: ₹${latestOrder.total_amount}\n📅 Placed: ${new Date(latestOrder.created_at).toLocaleDateString()}\n\n📋 To cancel:\n1. Go to Account → My Orders\n2. Select this order\n3. Click "Cancel Order"\n\n💡 Refund will be processed within 5-7 business days.\n\nNeed help? Contact: support@brohood.com`,
            orders: [latestOrder],
            suggestions: ['Go to account', 'Refund policy', 'Contact support']
          };
        } else {
          return {
            text: `⚠️ Order Cancellation:\n\nYour order #${latestOrder.order_number} is ${latestOrder.status}.\n\n❌ Cannot cancel orders that are:\n• Processing\n• Shipped\n• Delivered\n\n🔄 But you can:\n• Return within 7 days of delivery\n• Get full refund or exchange\n\n📞 Need urgent help? Contact: support@brohood.com`,
            orders: [latestOrder],
            suggestions: ['Return policy', 'Contact support', 'Track order']
          };
        }
      }

      if (lowerQuery.includes('delay') || lowerQuery.includes('late') || lowerQuery.includes('not received')) {
        const deliveryDays = latestOrder.status === 'delivered' ? 0 : 5 - orderAge;
        return {
          text: `📦 Order Delivery Status:\n\nOrder #${latestOrder.order_number}\n\n📊 Current Status: ${latestOrder.status.toUpperCase()}\n📅 Ordered: ${new Date(latestOrder.created_at).toLocaleDateString()}\n⏱️ Days since order: ${orderAge}\n\n${latestOrder.status === 'delivered' 
            ? '✅ Your order has been delivered!' 
            : deliveryDays > 0 
              ? `⏳ Expected delivery: ${deliveryDays} more day(s)\n\n📍 Standard delivery: 5-7 business days\n🚀 Express available on select items` 
              : '⚠️ Order is delayed. Please contact support.'}\n\n${orderAge > 7 && latestOrder.status !== 'delivered' ? '🆘 Order delayed? We apologize!\n📞 Contact: support@brohood.com\n📧 We\'ll resolve this ASAP!' : ''}`,
          orders: [latestOrder],
          suggestions: ['Contact support', 'Track order', 'Return policy']
        };
      }

      if (lowerQuery.includes('return') || lowerQuery.includes('exchange')) {
        if (latestOrder.status === 'delivered' && orderAge <= 7) {
          return {
            text: `🔄 Return/Exchange Available!\n\nOrder #${latestOrder.order_number}\n✅ Eligible for return (delivered ${orderAge} days ago)\n\n📋 Return Policy:\n• 7-day return window ✅\n• Free return pickup 🚚\n• Full refund or exchange 💰\n\n✅ Conditions:\n• Unused with original tags\n• Original packaging\n• No damage or alterations\n\n📞 To initiate return:\nContact: support@brohood.com\nPhone: [Your number]\n\n💡 Refund processed in 5-7 business days after pickup.`,
            orders: [latestOrder],
            suggestions: ['Contact support', 'Refund policy', 'Exchange policy']
          };
        } else if (orderAge > 7) {
          return {
            text: `⚠️ Return Window Closed\n\nOrder #${latestOrder.order_number}\n❌ Delivered ${orderAge} days ago\n\n📋 Our Policy:\n• 7-day return window (expired)\n• Returns accepted within 7 days of delivery\n\n🆘 Special circumstances?\n• Defective product?\n• Wrong item received?\n\nContact us: support@brohood.com\nWe'll do our best to help!`,
            orders: [latestOrder],
            suggestions: ['Contact support', 'Quality issue', 'Browse products']
          };
        } else {
          return {
            text: `📦 Order Status: ${latestOrder.status}\n\nOrder #${latestOrder.order_number}\n\n⏳ Return/exchange available after delivery!\n\n📋 What you can do:\n• Wait for delivery\n• Cancel if not shipped\n• Contact support for changes\n\n🔄 After delivery:\n• 7-day return window\n• Free pickup\n• Full refund or exchange`,
            orders: [latestOrder],
            suggestions: ['Cancel order', 'Contact support', 'Track order']
          };
        }
      }

      if (lowerQuery.includes('refund') || lowerQuery.includes('money back')) {
        return {
          text: `💰 Refund Policy:\n\n✅ Full Refund Available:\n• Cancelled orders (before shipping)\n• Returned items (within 7 days)\n• Payment failures\n• Defective products\n\n⏱️ Refund Timeline:\n• Initiated: Within 24 hours\n• Processed: 5-7 business days\n• Credited to: Original payment method\n\n💳 Refund Methods:\n• UPI: 1-3 days\n• Cards: 5-7 days\n• Net Banking: 5-7 days\n• COD: Bank transfer (provide details)\n\n📞 Track refund status:\nContact: support@brohood.com`,
          suggestions: ['Check order status', 'Contact support', 'Return policy']
        };
      }

      if (lowerQuery.includes('payment') || lowerQuery.includes('paid') || lowerQuery.includes('transaction')) {
        return {
          text: `💳 Payment Information:\n\nYour latest order #${latestOrder.order_number}:\n\n💰 Amount: ₹${latestOrder.total_amount}\n📊 Payment Status: ${latestOrder.payment_status?.toUpperCase() || 'PENDING'}\n💳 Method: ${latestOrder.payment_method || 'Not specified'}\n${latestOrder.razorpay_payment_id ? `🔑 Payment ID: ${latestOrder.razorpay_payment_id}` : ''}\n\n${latestOrder.payment_status === 'paid' 
            ? '✅ Payment successful!' 
            : latestOrder.payment_status === 'failed' 
              ? '❌ Payment failed. Please retry or contact support.' 
              : '⏳ Payment pending. Please complete payment.'}\n\n🆘 Payment issues?\nContact: support@brohood.com\nProvide Order ID for quick resolution.`,
          orders: [latestOrder],
          suggestions: ['Contact support', 'Retry payment', 'Refund policy']
        };
      }

      // Default: Show all orders with full details
      const orderDetails = orders.map((o, idx) => {
        const daysAgo = Math.floor((Date.now() - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24));
        return `\n${idx + 1}. Order #${o.order_number}\n   📊 Status: ${o.status.toUpperCase()}\n   💰 Amount: ₹${o.total_amount}\n   📦 Items: ${o.items?.length || 0}\n   📅 Placed: ${daysAgo} day(s) ago\n   💳 Payment: ${o.payment_status?.toUpperCase() || 'N/A'}`;
      }).join('\n');

      return {
        text: `📦 Your Recent Orders (${orders.length}):\n${orderDetails}\n\n💡 I can help you with:\n• Track delivery status\n• Cancel orders\n• Returns & exchanges\n• Refund status\n• Payment issues\n\nWhat would you like to know?`,
        suggestions: ['Track latest order', 'Return policy', 'Cancel order', 'Contact support']
      };
    } catch (error) {
      console.error('Order query error:', error);
      return {
        text: "📦 Having trouble fetching your orders.\n\n👉 Please try:\n• Visit Account → My Orders\n• Refresh the page\n• Contact support\n\n📞 Support: support@brohood.com",
        suggestions: ['Go to account', 'Contact support', 'Try again']
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
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-14 sm:h-14 sm:w-14 rounded-full shadow-lg bg-black hover:bg-gray-800 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 sm:h-6 sm:w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[380px] md:w-[420px] h-[100vh] sm:h-[600px] sm:rounded-2xl shadow-2xl flex flex-col z-50 border-0 sm:border border-gray-200 bg-white">
          {/* Header */}
          <div className="bg-black text-white p-3 sm:p-4 sm:rounded-t-2xl flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">BroHood AI Assistant</h3>
                <p className="text-xs text-gray-300">Your Style Companion</p>
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
                      className={`rounded-2xl px-3 py-2 sm:px-4 ${message.sender === 'user'
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
          </div>
        </div>
      )}
    </>
  );
}
