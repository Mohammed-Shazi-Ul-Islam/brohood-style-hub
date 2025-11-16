const SizeGuide = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Size Guide</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Shirts Size Chart</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Size</th>
                    <th className="border p-3 text-left">Chest (inches)</th>
                    <th className="border p-3 text-left">Length (inches)</th>
                    <th className="border p-3 text-left">Shoulder (inches)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border p-3">S</td><td className="border p-3">36-38</td><td className="border p-3">27-28</td><td className="border p-3">16-17</td></tr>
                  <tr><td className="border p-3">M</td><td className="border p-3">38-40</td><td className="border p-3">28-29</td><td className="border p-3">17-18</td></tr>
                  <tr><td className="border p-3">L</td><td className="border p-3">40-42</td><td className="border p-3">29-30</td><td className="border p-3">18-19</td></tr>
                  <tr><td className="border p-3">XL</td><td className="border p-3">42-44</td><td className="border p-3">30-31</td><td className="border p-3">19-20</td></tr>
                  <tr><td className="border p-3">XXL</td><td className="border p-3">44-46</td><td className="border p-3">31-32</td><td className="border p-3">20-21</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Pants Size Chart</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Size</th>
                    <th className="border p-3 text-left">Waist (inches)</th>
                    <th className="border p-3 text-left">Length (inches)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border p-3">28</td><td className="border p-3">28</td><td className="border p-3">39-40</td></tr>
                  <tr><td className="border p-3">30</td><td className="border p-3">30</td><td className="border p-3">40-41</td></tr>
                  <tr><td className="border p-3">32</td><td className="border p-3">32</td><td className="border p-3">41-42</td></tr>
                  <tr><td className="border p-3">34</td><td className="border p-3">34</td><td className="border p-3">42-43</td></tr>
                  <tr><td className="border p-3">36</td><td className="border p-3">36</td><td className="border p-3">43-44</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold mb-2">How to Measure</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Chest:</strong> Measure around the fullest part of your chest</li>
              <li><strong>Waist:</strong> Measure around your natural waistline</li>
              <li><strong>Length:</strong> Measure from shoulder to hem</li>
              <li><strong>Shoulder:</strong> Measure from shoulder point to shoulder point</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
