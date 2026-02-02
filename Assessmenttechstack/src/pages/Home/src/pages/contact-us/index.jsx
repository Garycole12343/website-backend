import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/navigation/Header';
import ContactForm from './components/ContactForm';
import ContactInfo from './components/ContactInfo';
import FAQSection from './components/FAQSection';
import SocialLinks from './components/SocialLinks';
import Icon from '../../components/AppIcon';

const ContactUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Contact Us - Skill Swap Hub</title>
        <meta name="description" content="Get in touch with Skill Swap Hub. Contact our support team, explore FAQs, or connect with us on social media for assistance and community engagement." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="mb-8 lg:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="MessageCircle" size={24} color="var(--color-primary)" />
              </div>
              <div>
                <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
                  Contact Us
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  We're here to help and answer any questions you might have
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
            <div className="lg:col-span-1">
              <ContactInfo />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            <FAQSection />
            <SocialLinks />
          </div>

          <div className="bg-card rounded-lg border border-border p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">
                Visit Our Office
              </h2>
              <p className="text-muted-foreground text-sm">
                Drop by our office during business hours for in-person assistance
              </p>
            </div>

            <div className="w-full h-[400px] rounded-lg overflow-hidden border border-border">
              <iframe
                width="100%"
                height="100%"
                loading="lazy"
                title="Skill Swap Hub Office Location"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps?q=37.7749,-122.4194&z=14&output=embed"
                className="w-full h-full"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <Icon name="MapPin" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-1">
                    Address
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    123 Innovation Street, Tech District, San Francisco, CA 94105
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <Icon name="Clock" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-1">
                    Office Hours
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Mon-Fri: 9 AM - 6 PM EST
                    <br />
                    Sat: 10 AM - 4 PM EST
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <Icon name="Car" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground text-sm mb-1">
                    Parking
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Free visitor parking available in building garage
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-card border-t border-border mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date()?.getFullYear()} Skill Swap Hub. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ContactUs;