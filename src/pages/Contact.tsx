import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-600 text-lg">
            We'd love to hear from you. Get in touch with us.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              <form className="space-y-4">
                <div>
                  <Input placeholder="Your Name" />
                </div>
                <div>
                  <Input type="email" placeholder="Your Email" />
                </div>
                <div>
                  <Input placeholder="Subject" />
                </div>
                <div>
                  <Textarea placeholder="Your Message" rows={6} />
                </div>
                <Button className="w-full bg-black hover:bg-gray-800">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Address</h3>
                    <p className="text-gray-600">
                      Bangalore, Karnataka, India
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Phone</h3>
                    <a href="tel:+916364145515" className="text-gray-600 hover:text-gold">
                      +91 6364 145 515
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Email</h3>
                    <a
                      href="mailto:brohoodmensfashionupdate@gmail.com"
                      className="text-gray-600 hover:text-gold break-all"
                    >
                      brohoodmensfashionupdate@gmail.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Store Hours</h3>
                    <p className="text-gray-600">
                      Mon - Sat: 10:00 AM - 9:00 PM<br />
                      Sunday: 11:00 AM - 8:00 PM
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-0">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.0408960630966!2d77.62997537464967!3d12.90509188740416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae151e228deddd%3A0xe2de04ce2553ff67!2sBrohoodmensfashionupdate!5e0!3m2!1sen!2sin!4v1763308177024!5m2!1sen!2sin"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="BroHood Store Location"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
