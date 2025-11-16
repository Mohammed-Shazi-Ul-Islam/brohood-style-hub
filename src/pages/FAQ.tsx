const FAQ = () => {
  const faqs = [
    {
      q: "How do I place an order?",
      a: "Browse our collection, add items to cart, proceed to checkout, and complete payment. You'll receive an order confirmation via email."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept UPI, Credit/Debit Cards, Net Banking, Wallets, and Cash on Delivery (COD)."
    },
    {
      q: "How long does delivery take?",
      a: "Delivery takes 3-5 business days for metro cities and 5-7 days for other locations."
    },
    {
      q: "Do you offer free shipping?",
      a: "Yes! We offer FREE shipping on all orders above ₹999."
    },
    {
      q: "Can I return or exchange my order?",
      a: "Yes, we have a 7-day return and exchange policy. Items must be unused with tags intact."
    },
    {
      q: "How do I track my order?",
      a: "You'll receive a tracking number via email and SMS once your order is shipped. You can also track it from your account."
    },
    {
      q: "What if I receive a damaged product?",
      a: "Please contact us immediately with photos. We'll arrange a replacement or refund."
    },
    {
      q: "Do you have a physical store?",
      a: "Yes! Visit us in Bangalore, Karnataka. Check our Contact page for details."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-3">{faq.q}</h3>
              <p className="text-gray-700">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-gray-700 mb-4">
            Contact our customer support team
          </p>
          <p className="text-gray-700">
            Email: brohoodmensfashionupdate@gmail.com<br />
            Phone: +91 6364 145 515
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
