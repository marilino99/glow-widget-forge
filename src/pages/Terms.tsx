import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";

const Terms = () => {
  usePageMeta({ title: "Terms of Service — Widjet", description: "Widjet terms of service." });
  return (
  <div className="min-h-screen bg-background px-6 py-16">
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      <h1 className="mb-2 text-3xl font-bold text-foreground">Terms of Service</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: March 9, 2026</p>

      <div className="prose prose-sm max-w-none text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4 [&_ul]:mb-4 [&_li]:mb-1">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using Widjet ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>

        <h2>2. Description of Service</h2>
        <p>Widjet provides a widget builder platform that allows users to create and embed customizable widgets on their websites, including chatbots, FAQ sections, product carousels, and more.</p>

        <h2>3. Account Registration</h2>
        <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6">
          <li>Use the Service for any unlawful purpose</li>
          <li>Transmit harmful, offensive, or misleading content through your widgets</li>
          <li>Attempt to interfere with or disrupt the Service</li>
          <li>Reverse engineer or attempt to extract the source code of the Service</li>
        </ul>

        <h2>5. Intellectual Property</h2>
        <p>The Service and its original content, features, and functionality are owned by Widjet and are protected by international copyright, trademark, and other intellectual property laws. Content you create using the Service remains yours.</p>

        <h2>6. Subscriptions and Payments</h2>
        <p>Some features require a paid subscription. Payments are processed through Stripe. You may cancel your subscription at any time through the account settings. Refunds are handled on a case-by-case basis.</p>

        <h2>7. Data and Privacy</h2>
        <p>Your use of the Service is also governed by our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. By using the Service, you consent to the collection and use of information as described therein.</p>

        <h2>8. Disclaimer of Warranties</h2>
        <p>The Service is provided "as is" without warranties of any kind, whether express or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free.</p>

        <h2>9. Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, Widjet shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.</p>

        <h2>10. Modifications</h2>
        <p>We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Continued use after changes constitutes acceptance.</p>

        <h2>11. Termination</h2>
        <p>We may suspend or terminate your account if you violate these Terms. Upon termination, your right to use the Service ceases immediately.</p>

        <h2>12. Governing Law</h2>
        <p>These Terms are governed by the laws of the European Union and the applicable laws of Italy. Any disputes shall be resolved in the courts of Italy.</p>

        <h2>13. Contact</h2>
        <p>For questions about these Terms, contact us at <a href="mailto:support@getwidjet.com" className="text-primary hover:underline">support@getwidjet.com</a>.</p>
      </div>
    </div>
  </div>
);

export default Terms;
