import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    attachment: null
  });

  const [errors, setErrors] = useState({});
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const subjectOptions = [
    { value: 'technical', label: 'Technical Support', description: 'Issues with platform functionality' },
    { value: 'content', label: 'Content Issues', description: 'Report inappropriate or incorrect content' },
    { value: 'partnerships', label: 'Partnerships', description: 'Business collaboration inquiries' },
    { value: 'general', label: 'General Inquiry', description: 'Other questions or feedback' }
  ];

  const maxMessageLength = 1000;
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'message') {
      setCharCount(value?.length);
    }
    
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, subject: value }));
    if (errors?.subject) {
      setErrors(prev => ({ ...prev, subject: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e?.target?.files?.[0];
    
    if (file) {
      if (file?.size > maxFileSize) {
        setErrors(prev => ({ ...prev, attachment: 'File size must be less than 5MB' }));
        return;
      }
      
      if (!allowedFileTypes?.includes(file?.type)) {
        setErrors(prev => ({ ...prev, attachment: 'Only JPG, PNG, GIF, and PDF files are allowed' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, attachment: file }));
      setErrors(prev => ({ ...prev, attachment: '' }));
    }
  };

  const removeAttachment = () => {
    setFormData(prev => ({ ...prev, attachment: null }));
    const fileInput = document.getElementById('attachment');
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.subject) {
      newErrors.subject = 'Please select a subject category';
    }
    
    if (!formData?.message?.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData?.message?.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      attachment: null
    });
    setCharCount(0);
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 5000);
  };

  const getResponseTime = () => {
    switch (formData?.subject) {
      case 'technical':
        return '24-48 hours';
      case 'content':
        return '48-72 hours';
      case 'partnerships':
        return '3-5 business days';
      default:
        return '2-3 business days';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">
          Send us a message
        </h2>
        <p className="text-muted-foreground text-sm">
          Fill out the form below and we'll get back to you as soon as possible
        </p>
      </div>
      {submitSuccess && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-start gap-3">
          <Icon name="CheckCircle2" size={20} color="var(--color-success)" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-success text-sm mb-1">
              Message sent successfully!
            </p>
            <p className="text-success/80 text-xs">
              We've received your inquiry and will respond within {getResponseTime()}
            </p>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Full Name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData?.name}
            onChange={handleInputChange}
            error={errors?.name}
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="john.doe@example.com"
            value={formData?.email}
            onChange={handleInputChange}
            error={errors?.email}
            required
          />
        </div>

        <Select
          label="Subject Category"
          placeholder="Select inquiry type"
          options={subjectOptions}
          value={formData?.subject}
          onChange={handleSelectChange}
          error={errors?.subject}
          required
        />

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
            Message <span className="text-destructive">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            placeholder="Please describe your inquiry in detail..."
            value={formData?.message}
            onChange={handleInputChange}
            maxLength={maxMessageLength}
            className={`w-full px-3 py-2 bg-background border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none ${
              errors?.message ? 'border-destructive' : 'border-input'
            }`}
          />
          <div className="flex items-center justify-between mt-1.5">
            {errors?.message ? (
              <p className="text-xs text-destructive">{errors?.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters required
              </p>
            )}
            <p className={`text-xs font-mono ${
              charCount > maxMessageLength * 0.9 ? 'text-warning' : 'text-muted-foreground'
            }`}>
              {charCount}/{maxMessageLength}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="attachment" className="block text-sm font-medium text-foreground mb-1.5">
            Attachment (Optional)
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Upload screenshots or relevant documents (Max 5MB, JPG/PNG/GIF/PDF)
          </p>
          
          {formData?.attachment ? (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-md border border-border">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="FileText" size={20} color="var(--color-primary)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {formData?.attachment?.name}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {(formData?.attachment?.size / 1024)?.toFixed(2)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={removeAttachment}
                className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors"
              >
                <Icon name="X" size={18} color="var(--color-destructive)" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
              <Icon name="Upload" size={20} color="var(--color-muted-foreground)" />
              <span className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </span>
              <input
                type="file"
                id="attachment"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.gif,.pdf"
                className="hidden"
              />
            </label>
          )}
          
          {errors?.attachment && (
            <p className="text-xs text-destructive mt-1.5">{errors?.attachment}</p>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="default"
            size="lg"
            fullWidth
            loading={isSubmitting}
            iconName="Send"
            iconPosition="right"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;