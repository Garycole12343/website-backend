import React, { useState } from 'react';
import Button from '../../../components/Button';
import Icon from '../../../components/AppIcon';

const DangerZone = ({ onDeleteAccount }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-error/20 p-6 mt-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Icon name="AlertTriangle" size={80} color="var(--color-error)" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
            <Icon name="Trash2" size={20} color="var(--color-error)" />
          </div>
          <h2 className="font-heading text-xl font-semibold text-error">
            Danger Zone
          </h2>
        </div>

        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
          Permanently delete your account and all associated data. This action is irreversible. 
          All your shared resources, messages, and profile information will be wiped from our servers in compliance with GDPR.
        </p>

        {!showConfirm ? (
          <Button 
            variant="outline" 
            className="border-error text-error hover:bg-error hover:text-white transition-all duration-300"
            onClick={() => setShowConfirm(true)}
          >
            Delete Account...
          </Button>
        ) : (
          <div className="space-y-4 p-5 bg-error/5 rounded-xl border border-error/20 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" size={20} color="var(--color-error)" className="mt-0.5" />
              <div>
                <p className="text-sm font-bold text-error">Are you absolutely sure?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  By clicking below, you confirm that you want to permanently remove your presence from SkillSphere.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button 
                className="bg-error text-white hover:bg-error/90 border-0 flex-1"
                onClick={onDeleteAccount}
              >
                Yes, Delete Everything
              </Button>
              <Button 
                variant="ghost" 
                className="flex-1 border border-border"
                onClick={() => setShowConfirm(false)}
              >
                Wait, I changed my mind
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DangerZone;
