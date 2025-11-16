const Returns = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-8 text-center">Returns & Exchange Policy</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4">7-Day Return Policy</h2>
            <p className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-4">
              We offer a hassle-free 7-day return policy. If you're not completely satisfied with your purchase, you can return it within 7 days of delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Return Conditions</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Product must be unused and in original condition</li>
              <li>All tags and labels must be intact</li>
              <li>Original packaging should be retained</li>
              <li>Invoice/receipt must be included</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Exchange Policy</h2>
            <p className="text-gray-700 mb-4">
              We offer size and color exchanges subject to availability. Exchange requests must be made within 7 days of delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How to Return</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Contact our customer service team</li>
              <li>Provide your order number and reason for return</li>
              <li>Pack the item securely with all tags and invoice</li>
              <li>Ship it to our return address</li>
              <li>Refund will be processed within 7-10 business days</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Non-Returnable Items</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Innerwear and socks</li>
              <li>Products marked as "Final Sale"</li>
              <li>Damaged or altered items</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-700">
              For return/exchange queries:<br />
              Email: brohoodmensfashionupdate@gmail.com<br />
              Phone: +91 6364 145 515
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Returns;
