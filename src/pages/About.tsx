const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">About BroHood</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            Welcome to BroHood - your destination for premium men's fashion. We believe that every man deserves to look and feel his best, which is why we curate only the finest collections for the modern gentleman.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Our Story</h2>
          <p className="text-gray-700 leading-relaxed">
            Founded with a passion for quality and style, BroHood has been serving fashion-forward men who value sophistication and elegance. Our carefully selected collections combine timeless classics with contemporary trends.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            To provide premium quality men's fashion that empowers confidence and style. We're committed to offering exceptional products, outstanding service, and an unparalleled shopping experience.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Why Choose Us</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Premium quality fabrics and materials</li>
            <li>Curated collections for every occasion</li>
            <li>Expert styling advice</li>
            <li>Hassle-free returns and exchanges</li>
            <li>Fast and reliable shipping</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
