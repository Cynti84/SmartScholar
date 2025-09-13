import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Footer } from '../../../shared/components/footer/footer';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  isOpen?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-faq',
  imports: [CommonModule, RouterModule, FormsModule, Navbar, Footer],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
})
export class Faq implements OnInit {
  searchQuery: string = '';
  selectedCategory: string = 'all';
  filteredFAQs: FAQ[] = [];

  categories: Category[] = [
    { id: 'all', name: 'All Questions', icon: '📋' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'scholarships', name: 'Scholarships', icon: '🎓' },
    { id: 'profile', name: 'Profile & Matching', icon: '👤' },
    { id: 'applications', name: 'Applications', icon: '📝' },
    { id: 'technical', name: 'Technical Support', icon: '🛠️' },
    { id: 'account', name: 'Account & Billing', icon: '⚙️' },
  ];

  faqs: FAQ[] = [
    // Getting Started
    {
      id: 1,
      question: 'What is SmartScholar and how does it work?',
      answer: `SmartScholar is an AI-powered platform that helps students discover and apply for scholarships that match their unique profile and qualifications. Our intelligent matching system analyzes your academic background, interests, demographics, and goals to recommend the most relevant scholarship opportunities. 
      
      <strong>How it works:</strong><br>
      1. Create your detailed profile<br>
      2. Our AI analyzes thousands of scholarships<br>
      3. Get personalized recommendations<br>
      4. Apply directly through our platform<br>
      5. Track your applications and deadlines`,
      category: 'getting-started',
      keywords: ['smartscholar', 'how it works', 'platform', 'ai', 'matching'],
    },
    {
      id: 2,
      question: 'Is SmartScholar free to use?',
      answer: `SmartScholar offers both free and premium tiers:<br><br>
      
      <strong>Free Tier includes:</strong><br>
      • Basic profile creation<br>
      • Access to 500+ scholarships<br>
      • Basic matching algorithm<br>
      • Standard application tracking<br><br>
      
      <strong>Premium Tier includes:</strong><br>
      • Advanced AI matching<br>
      • Access to 5000+ exclusive scholarships<br>
      • Priority application review<br>
      • Personalized essay assistance<br>
      • Deadline reminders and notifications`,
      category: 'getting-started',
      keywords: ['free', 'premium', 'pricing', 'cost', 'tiers'],
    },
    {
      id: 3,
      question: 'How do I get started with SmartScholar?',
      answer: `Getting started is easy! Follow these simple steps:<br><br>
      
      1. <strong>Sign up</strong> - Create your account with your email<br>
      2. <strong>Complete your profile</strong> - Add your academic info, interests, and goals<br>
      3. <strong>Verify your information</strong> - Upload necessary documents<br>
      4. <strong>Get matched</strong> - Our AI will start recommending scholarships<br>
      5. <strong>Start applying</strong> - Apply to scholarships that interest you<br><br>
      
      The entire process takes about 15-20 minutes to complete your initial profile.`,
      category: 'getting-started',
      keywords: ['getting started', 'sign up', 'registration', 'profile', 'setup'],
    },

    // Scholarships
    {
      id: 4,
      question: 'How many scholarships are available on SmartScholar?',
      answer: `SmartScholar maintains an extensive database of scholarships:<br><br>
      
      • <strong>5,000+</strong> active scholarship opportunities<br>
      • <strong>500+</strong> new scholarships added monthly<br>
      • Scholarships ranging from $500 to $50,000+<br>
      • Local, national, and international opportunities<br>
      • Merit-based, need-based, and demographic-specific scholarships<br><br>
      
      Our database is continuously updated to ensure you have access to the latest opportunities.`,
      category: 'scholarships',
      keywords: ['scholarships', 'database', 'opportunities', 'how many', 'available'],
    },
    {
      id: 5,
      question: 'How accurate is the scholarship matching system?',
      answer: `Our AI-powered matching system has a <strong>92% accuracy rate</strong> based on successful applications. Here's what makes it effective:<br><br>
      
      • <strong>Multi-factor analysis</strong> - Considers 50+ data points<br>
      • <strong>Machine learning</strong> - Improves with each application<br>
      • <strong>Real-time updates</strong> - Adjusts to new requirements<br>
      • <strong>User feedback integration</strong> - Learns from your preferences<br><br>
      
      The more complete your profile, the more accurate your matches become.`,
      category: 'scholarships',
      keywords: ['matching', 'accuracy', 'ai', 'algorithm', 'success rate'],
    },
    {
      id: 6,
      question: 'Can I apply to scholarships directly through SmartScholar?',
      answer: `Yes! SmartScholar offers multiple application options:<br><br>
      
      <strong>Direct Applications:</strong><br>
      • Submit applications through our platform<br>
      • Auto-fill forms using your profile data<br>
      • Upload documents once, use everywhere<br><br>
      
      <strong>External Applications:</strong><br>
      • Get detailed information and requirements<br>
      • Receive direct links to external applications<br>
      • Track deadlines and progress<br><br>
      
      All applications are tracked in your dashboard regardless of submission method.`,
      category: 'scholarships',
      keywords: ['apply', 'applications', 'direct', 'external', 'submit'],
    },

    // Profile & Matching
    {
      id: 7,
      question: 'What information do I need to provide in my profile?',
      answer: `To get the best matches, include these key details in your profile:<br><br>
      
      <strong>Academic Information:</strong><br>
      • GPA and test scores (SAT, ACT, etc.)<br>
      • School name and graduation date<br>
      • Intended major and career goals<br><br>
      
      <strong>Personal Details:</strong><br>
      • Demographics and background<br>
      • Geographic location<br>
      • Financial need information<br><br>
      
      <strong>Activities & Achievements:</strong><br>
      • Extracurricular activities<br>
      • Leadership roles<br>
      • Community service<br>
      • Awards and honors`,
      category: 'profile',
      keywords: ['profile', 'information', 'details', 'requirements', 'data'],
    },
    {
      id: 8,
      question: 'How often should I update my profile?',
      answer: `We recommend updating your profile regularly to ensure optimal matching:<br><br>
      
      <strong>Update immediately when:</strong><br>
      • Your GPA changes<br>
      • You earn new awards or achievements<br>
      • Your financial situation changes<br>
      • You change your major or career goals<br><br>
      
      <strong>Review quarterly for:</strong><br>
      • New extracurricular activities<br>
      • Updated test scores<br>
      • Changed contact information<br><br>
      
      Updated profiles receive 3x more relevant scholarship matches!`,
      category: 'profile',
      keywords: ['update', 'profile', 'frequency', 'maintenance', 'optimal'],
    },

    // Applications
    {
      id: 9,
      question: 'How do I track my scholarship applications?',
      answer: `SmartScholar provides comprehensive application tracking through your dashboard:<br><br>
      
      <strong>Application Status:</strong><br>
      • Draft, Submitted, Under Review, Accepted/Rejected<br>
      • Real-time status updates<br>
      • Automated deadline reminders<br><br>
      
      <strong>Organization Tools:</strong><br>
      • Calendar view of all deadlines<br>
      • Application progress indicators<br>
      • Document checklist for each application<br>
      • Notes and reminders<br><br>
      
      You can also set up email and SMS notifications for important updates.`,
      category: 'applications',
      keywords: ['tracking', 'applications', 'status', 'dashboard', 'progress'],
    },
    {
      id: 10,
      question: 'What documents do I typically need for scholarship applications?',
      answer: `Common documents required for scholarship applications include:<br><br>
      
      <strong>Academic Documents:</strong><br>
      • Official transcripts<br>
      • Standardized test scores<br>
      • Letters of recommendation<br><br>
      
      <strong>Personal Documents:</strong><br>
      • Personal statement or essay<br>
      • Resume or CV<br>
      • Financial aid information (FAFSA)<br><br>
      
      <strong>Additional Materials:</strong><br>
      • Portfolio (for creative scholarships)<br>
      • Research papers or projects<br>
      • Community service documentation<br><br>
      
      SmartScholar's document vault lets you upload these once and reuse them across multiple applications.`,
      category: 'applications',
      keywords: ['documents', 'requirements', 'transcripts', 'essays', 'recommendations'],
    },

    // Technical Support
    {
      id: 11,
      question: "I'm having trouble logging into my account. What should I do?",
      answer: `If you're experiencing login issues, try these steps:<br><br>
      
      <strong>Common Solutions:</strong><br>
      • Clear your browser cache and cookies<br>
      • Try a different browser or incognito mode<br>
      • Check if Caps Lock is on<br>
      • Ensure you're using the correct email address<br><br>
      
      <strong>Password Reset:</strong><br>
      • Click "Forgot Password" on the login page<br>
      • Check your email for reset instructions<br>
      • Create a strong, unique password<br><br>
      
      If issues persist, contact our support team at <strong>support@smartscholar.com</strong> or use the live chat feature.`,
      category: 'technical',
      keywords: ['login', 'account', 'password', 'trouble', 'access'],
    },
    {
      id: 12,
      question: "Why isn't the website loading properly?",
      answer: `If SmartScholar isn't loading correctly, try these troubleshooting steps:<br><br>
      
      <strong>Browser Issues:</strong><br>
      • Refresh the page (Ctrl+F5 or Cmd+R)<br>
      • Clear browser cache and cookies<br>
      • Disable browser extensions temporarily<br>
      • Try a different browser<br><br>
      
      <strong>Connection Issues:</strong><br>
      • Check your internet connection<br>
      • Try accessing other websites<br>
      • Restart your router if needed<br><br>
      
      <strong>Device Issues:</strong><br>
      • Restart your device<br>
      • Update your browser to the latest version<br>
      • Check if JavaScript is enabled<br><br>
      
      For persistent issues, check our <strong>status page</strong> or contact support.`,
      category: 'technical',
      keywords: ['loading', 'website', 'browser', 'connection', 'troubleshooting'],
    },

    // Account & Billing
    {
      id: 13,
      question: 'How do I upgrade to Premium?',
      answer: `Upgrading to Premium is simple and gives you access to enhanced features:<br><br>
      
      <strong>Upgrade Steps:</strong><br>
      • Go to your Account Settings<br>
      • Click "Upgrade to Premium"<br>
      • Choose your billing preference (monthly/yearly)<br>
      • Enter payment information<br>
      • Enjoy premium features immediately<br><br>
      
      <strong>Premium Benefits:</strong><br>
      • Advanced AI matching algorithm<br>
      • Access to 5000+ exclusive scholarships<br>
      • Priority application processing<br>
      • Personalized essay review<br>
      • Unlimited application tracking<br><br>
      
      <strong>30-day money-back guarantee</strong> if you're not satisfied!`,
      category: 'account',
      keywords: ['upgrade', 'premium', 'billing', 'subscription', 'features'],
    },
    {
      id: 14,
      question: 'Can I cancel my Premium subscription?',
      answer: `Yes, you can cancel your Premium subscription at any time:<br><br>
      
      <strong>Cancellation Process:</strong><br>
      • Log into your account<br>
      • Go to Account Settings > Billing<br>
      • Click "Cancel Subscription"<br>
      • Confirm cancellation<br><br>
      
      <strong>What happens after cancellation:</strong><br>
      • You'll retain Premium access until the end of your billing period<br>
      • Your account will automatically switch to the free tier<br>
      • All your data and applications remain intact<br>
      • You can resubscribe anytime<br><br>
      
      No cancellation fees or hidden charges!`,
      category: 'account',
      keywords: ['cancel', 'subscription', 'premium', 'billing', 'refund'],
    },
    {
      id: 15,
      question: 'How do I delete my SmartScholar account?',
      answer: `We're sorry to see you go! Here's how to delete your account:<br><br>
      
      <strong>Before deletion:</strong><br>
      • Download any important documents<br>
      • Note down scholarship information you want to keep<br>
      • Cancel any active subscriptions<br><br>
      
      <strong>Deletion process:</strong><br>
      • Go to Account Settings<br>
      • Scroll to "Delete Account" section<br>
      • Follow the confirmation steps<br>
      • Your account will be permanently deleted within 30 days<br><br>
      
      <strong>Note:</strong> This action cannot be undone. All your data, applications, and matches will be permanently removed.`,
      category: 'account',
      keywords: ['delete', 'account', 'remove', 'permanent', 'data'],
    },
  ];

  ngOnInit(): void {
    this.filteredFAQs = [...this.faqs];
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.filterFAQs();
  }

  toggleFAQ(index: number): void {
    this.filteredFAQs[index].isOpen = !this.filteredFAQs[index].isOpen;

    // Close other FAQs (optional - for accordion behavior)
    // this.filteredFAQs.forEach((faq, i) => {
    //   if (i !== index) {
    //     faq.isOpen = false;
    //   }
    // });
  }

  filterFAQs(): void {
    let filtered = [...this.faqs];

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter((faq) => faq.category === this.selectedCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.keywords.some((keyword) => keyword.toLowerCase().includes(query))
      );
    }

    this.filteredFAQs = filtered;
  }
}
