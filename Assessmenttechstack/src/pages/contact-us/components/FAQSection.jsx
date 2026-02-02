import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const FAQSection = () => {
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    {
      id: 1,
      category: 'Account Management',
      question: 'How do I create an account on Skill Swap Hub?',
      answer: `Creating an account is simple and free. Click the "Sign Up" button in the top navigation, fill in your basic information including name, email, and password, then verify your email address. Once verified, you can complete your profile and start sharing or discovering skills immediately.`
    },
    {
      id: 2,
      category: 'Account Management',
      question: 'Can I change my email address or username?',
      answer: `Yes, you can update your email address and username from your profile settings. Navigate to "My Profile" and click the edit button. For security reasons, you'll need to verify your new email address before the change takes effect.`
    },
    {
      id: 3,
      category: 'Resource Posting',question: 'What types of resources can I share on the platform?',
      answer: `You can share various types of educational resources including tutorials, guides, video links, project files, templates, and learning materials across all our categories: Art & Design, Baking & Cooking, Coding & Tech, Sports & Fitness, Music & Audio, and AI & Automation. All content must comply with our community guidelines.`
    },
    {
      id: 4,
      category: 'Resource Posting',question: 'How do I edit or delete my posted resources?',answer: `Go to "My Profile" and navigate to the "My Resources" tab. You'll see all your posted resources with options to edit or delete each one. Click the edit icon to modify content, or the delete icon to remove a resource permanently. Note that deletion is irreversible.`
    },
    {
      id: 5,
      category: 'Community Guidelines',
      question: 'What are the rules for commenting and rating?',
      answer: `Comments and ratings should be constructive, respectful, and relevant to the resource. Prohibited content includes spam, harassment, offensive language, or promotional material. Users who violate these guidelines may have their commenting privileges suspended or accounts terminated.`
    },
    {
      id: 6,
      category: 'Community Guidelines',
      question: 'How do I report inappropriate content?',
      answer: `Each resource and comment has a report button (flag icon). Click it to submit a report with details about the violation. Our moderation team reviews all reports within 24-48 hours and takes appropriate action according to our community guidelines.`
    },
    {
      id: 7,
      category: 'Technical Issues',
      question: 'Why can\'t I upload files or images?',
      answer: `File upload issues are usually caused by file size or format restrictions. Ensure your files are under 5MB and in supported formats (JPG, PNG, GIF, PDF). Clear your browser cache and try again. If the problem persists, contact technical support with details about your browser and operating system.`
    },
    {
      id: 8,
      category: 'Technical Issues',
      question: 'The website is loading slowly or not working properly',
      answer: `First, try clearing your browser cache and cookies, then refresh the page. Ensure you're using an updated browser version (Chrome, Firefox, Safari, or Edge). Check your internet connection stability. If issues continue, try accessing the site from a different device or network to isolate the problem.`
    }
  ];

  const categories = [...new Set(faqs.map(faq => faq.category))];

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground text-sm">
          Find quick answers to common questions about using Skill Swap Hub
        </p>
      </div>
      <div className="space-y-6">
        {categories?.map((category) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {category}
              </h3>
            </div>
            
            <div className="space-y-2">
              {faqs?.filter(faq => faq?.category === category)?.map((faq) => (
                  <div
                    key={faq?.id}
                    className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                  >
                    <button
                      onClick={() => toggleFAQ(faq?.id)}
                      className="w-full flex items-center justify-between gap-4 p-4 text-left bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium text-foreground text-sm flex-1">
                        {faq?.question}
                      </span>
                      <Icon
                        name={expandedId === faq?.id ? 'ChevronUp' : 'ChevronDown'}
                        size={20}
                        color="var(--color-muted-foreground)"
                        className="flex-shrink-0 transition-transform"
                      />
                    </button>
                    
                    {expandedId === faq?.id && (
                      <div className="p-4 bg-background border-t border-border">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {faq?.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="HelpCircle" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground mb-1">
              <span className="font-medium">Can't find what you're looking for?</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Use the contact form above to send us your specific question, and we'll get back to you with a detailed answer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;