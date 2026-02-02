import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import RegistrationForm from './components/RegistrationForm';
import SocialRegistration from './components/SocialRegistration';
import RegistrationBenefits from './components/RegistrationBenefits';
import Icon from '../../components/AppIcon';

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/home-dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <RegistrationBenefits />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="bg-card border border-border rounded-xl shadow-sm p-6 sm:p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="UserPlus" size={24} color="var(--color-primary)" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
                        Create Account
                      </h1>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start your skill sharing journey today
                      </p>
                    </div>
                  </div>
                </div>

                <RegistrationForm />

                <div className="mt-6">
                  <SocialRegistration />
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Icon name="Lock" size={14} />
                  <span>Secured with 256-bit SSL encryption</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  By creating an account, you agree to our terms and policies
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date()?.getFullYear()} Skill Swap Hub. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Terms
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Privacy
              </Link>
              <Link to="/contact-us" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Register;