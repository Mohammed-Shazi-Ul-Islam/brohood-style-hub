const Shipping = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-8 text-center">Shipping Policy</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">Shipping Information</h2>
            <p className="text-gray-700 mb-4">
              We offer fast and reliable shipping across India. Your order will be carefully packaged and dispatched within 1-2 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Delivery Time</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Metro Cities: 3-5 business days</li>
              <li>Other Cities: 5-7 business days</li>
              <li>Remote Areas: 7-10 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Shipping Charges</h2>
            <p className="text-gray-700">
              <strong>FREE SHIPPING</strong> on all orders above ₹999<br />
              Orders below ₹999: ₹99 shipping charge
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Order Tracking</h2>
            <p className="text-gray-700">
              Once your order is shipped, you will receive a tracking number via email and SMS. You can track your order status in real-time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-700">
              For any shipping-related queries, please contact us at:<br />
              Email: brohoodmensfashionupdate@gmail.com<br />
              Phone: +91 6364 145 515
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
