import React, { useState, useContext } from 'react';
import Button from '../../../components/Button';
import Icon from '../../../components/AppIcon';
import { AuthContext } from '../../../context/AuthContext';

const SecuritySettings = () => {
  const { userEmail } = useContext(AuthContext);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!userEmail) return;

    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    if (passwords.newPassword.length < 8) {
        setStatus({ type: 'error', message: 'New password must be at least 8 characters' });
        return;
    }
    
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Password updated successfully' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to update password' });
      }
    } catch (err) {
      console.error('Password update error:', err);
      setStatus({ type: 'error', message: 'Could not connect to server' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 mb-6 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <Icon name="Shield" size={24} color="var(--color-primary)" />
        </div>
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Security & Password
        </h2>
      </div>

      <form onSubmit={handleUpdatePassword} className="space-y-4">
        {status.message && (
          <div className={`p-3 rounded-lg text-sm ${
            status.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'
          }`}>
            {status.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="hidden md:block"></div> {/* Spacer */}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" variant="default" isLoading={isLoading}>
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySettings;
