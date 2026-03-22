import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import Header from '../../components/navigation/Header';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const mockCredentials = {
    email: 'demo@skillswaphub.com',
    password: 'SkillSwap2025!'
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData(prev => ({
      ...prev,
      rememberMe: e?.target?.checked
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (
        formData?.email === mockCredentials?.email &&
        formData?.password === mockCredentials?.password
      ) {
        localStorage.setItem('authToken', 'mock-jwt-token-' + Date.now());
        localStorage.setItem('userEmail', formData?.email);
        if (formData?.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        navigate('/home-dashboard');
      } else {
        setErrors({
          submit: `Invalid credentials. Please use:\nEmail: ${mockCredentials?.email}\nPassword: ${mockCredentials?.password}`
        });
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('authToken', `mock-${provider}-token-` + Date.now());
      localStorage.setItem('userEmail', `user@${provider}.com`);
      navigate('/home-dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg shadow-elevated p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Icon name="GraduationCap" size={32} color="var(--color-primary)" />
              </div>
              <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
                Welcome Back
              </h1>
              <p className="text-muted-foreground text-base">
                Sign in to continue your skill sharing journey
              </p>
            </div>

            {errors?.submit && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-start gap-3">
                  <Icon name="AlertCircle" size={20} color="var(--color-destructive)" className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-destructive font-medium mb-1">Authentication Failed</p>
                    <p className="text-xs text-destructive/80 whitespace-pre-line">{errors?.submit}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData?.email}
                onChange={handleInputChange}
                error={errors?.email}
                required
                disabled={isLoading}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData?.password}
                  onChange={handleInputChange}
                  error={errors?.password}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors duration-200"
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <Checkbox
                  label="Remember me"
                  checked={formData?.rememberMe}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Link
                  to="/register"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="default"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
                iconName="LogIn"
                iconPosition="right"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="flex items-center justify-center px-4 py-3 border border-border rounded-md hover:bg-muted transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Sign in with Google"
                >
                  <Image
                    src="https://www.google.com/favicon.ico"
                    alt="Google logo icon with multicolored G letter on white background"
                    className="w-5 h-5"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoading}
                  className="flex items-center justify-center px-4 py-3 border border-border rounded-md hover:bg-muted transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Sign in with GitHub"
                >
                  <Icon name="Github" size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('linkedin')}
                  disabled={isLoading}
                  className="flex items-center justify-center px-4 py-3 border border-border rounded-md hover:bg-muted transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Sign in with LinkedIn"
                >
                  <Icon name="Linkedin" size={20} />
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary hover:text-primary/80 transition-colors duration-200"
                >
                  Create Account
                </Link>
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Icon name="Shield" size={14} color="var(--color-success)" />
              <span>Secured with 256-bit SSL encryption</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              By signing in, you agree to our{' '}
              <Link to="/contact-us" className="text-primary hover:text-primary/80 transition-colors duration-200">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/contact-us" className="text-primary hover:text-primary/80 transition-colors duration-200">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </main>
      <footer className="py-6 px-4 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date()?.getFullYear()} Skill Swap Hub. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="/contact-us"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Help Center
              </Link>
              <Link
                to="/contact-us"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;