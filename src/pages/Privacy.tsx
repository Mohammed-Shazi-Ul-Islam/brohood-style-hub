const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-8 text-center">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 text-sm sm:text-base text-gray-700">
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 text-black">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including name, email address, phone number, shipping address, and payment information.</p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 text-black">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-sm sm:text-base">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and updates</li>
              <li>Respond to your inquiries</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Improve our website and services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 text-black">3. Information Sharing</h2>
            <p>We do not sell or rent your personal information to third parties. We may share information with service providers who assist us in operating our website and conducting our business.</p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 text-black">4. Data Security</h2>
            <p className="text-sm sm:text-base">We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 text-black">5. Cookies</h2>
            <p className="text-sm sm:text-base">We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookies through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 text-black">6. Your Rights</h2>
            <p className="text-sm sm:text-base">You have the right to access, update, or delete your personal information. Contact us to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 text-black">7. Changes to Privacy Policy</h2>
            <p className="text-sm sm:text-base">We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-4 text-black">8. Contact Us</h2>
            <p>
              For privacy-related questions, contact us at:<br />
              Email: brohoodmensfashionupdate@gmail.com<br />
              Phone: +91 6364 145 515
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
