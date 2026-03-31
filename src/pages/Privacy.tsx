import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";

const Privacy = () => {
  usePageMeta({ title: "Privacy Policy — Widjet", description: "Widjet privacy policy." });
  return (
  <div className="min-h-screen bg-background px-6 py-16">
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      <h1 className="mb-2 text-3xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: March 9, 2026</p>

      <div className="prose prose-sm max-w-none text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4 [&_ul]:mb-4 [&_li]:mb-1">
        <h2>1. Introduction</h2>
        <p>Widjet ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our widget builder platform.</p>

        <h2>2. Information We Collect</h2>
        <p><strong>Account Information:</strong> When you register, we collect your name, email address, and password.</p>
        <p><strong>Widget Data:</strong> Content you create (FAQs, product cards, chatbot configurations, custom links) is stored to provide the Service.</p>
        <p><strong>Usage Data:</strong> We collect analytics data such as widget impressions, clicks, and visitor interactions to provide you with dashboard insights.</p>
        <p><strong>Visitor Data:</strong> When visitors interact with your widgets, we may collect their browser type, country, and conversation content to enable chat functionality.</p>

        <h2>3. How We Use Your Information</h2>
        <ul className="list-disc pl-6">
          <li>To provide, maintain, and improve the Service</li>
          <li>To process transactions and manage subscriptions</li>
          <li>To provide analytics and insights through your dashboard</li>
          <li>To communicate with you about updates and support</li>
          <li>To ensure security and prevent fraud</li>
        </ul>

        <h2>4. AI and Your Data</h2>
        <p>If you enable the AI chatbot feature, your training data (website content, uploaded documents) is used solely for generating responses within your widget. <strong>Your data is never used to train AI models.</strong> We use inference-only mode with third-party AI providers.</p>

        <h2>5. Data Storage and Security</h2>
        <p>Your data is stored on cloud infrastructure within the European Union. We use industry-standard security measures including:</p>
        <ul className="list-disc pl-6">
          <li>HTTPS/TLS encryption for all data in transit</li>
          <li>Row-level security policies for per-account data isolation</li>
          <li>Regular security audits of our infrastructure</li>
        </ul>
        <p><em>Note: While we implement robust security practices, we do not currently hold formal security certifications (e.g., SOC 2, ISO 27001). We are transparent about our security posture and continuously working to improve it.</em></p>

        <h2>6. Data Sharing</h2>
        <p>We do not sell your data to third parties. We may share data with:</p>
        <ul className="list-disc pl-6">
          <li><strong>Service providers:</strong> Payment processing (Stripe), cloud hosting, AI inference providers — only as necessary to operate the Service</li>
          <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
        </ul>

        <h2>7. Your Rights (GDPR)</h2>
        <p>If you are in the EU/EEA, you have the right to:</p>
        <ul className="list-disc pl-6">
          <li>Access your personal data</li>
          <li>Rectify inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to or restrict processing</li>
          <li>Data portability</li>
          <li>Withdraw consent at any time</li>
        </ul>
        <p>To exercise these rights, contact us at <a href="mailto:support@getwidjet.com" className="text-primary hover:underline">support@getwidjet.com</a>.</p>

        <h2>8. Cookies</h2>
        <p>We use essential cookies for authentication and session management. We use analytics tools to understand how the Service is used. You can control cookie preferences through your browser settings.</p>

        <h2>9. Data Retention</h2>
        <p>We retain your data for as long as your account is active. Upon account deletion, we remove your personal data within 30 days, except where retention is required by law.</p>

        <h2>10. Children's Privacy</h2>
        <p>The Service is not intended for children under 16. We do not knowingly collect data from children.</p>

        <h2>11. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of material changes via email or through the Service.</p>

        <h2>12. Contact</h2>
        <p>For privacy-related questions or requests, contact us at <a href="mailto:support@getwidjet.com" className="text-primary hover:underline">support@getwidjet.com</a>.</p>
      </div>
    </div>
  </div>
);

export default Privacy;
