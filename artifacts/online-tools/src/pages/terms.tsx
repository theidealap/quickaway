import { SEO } from '@/components/seo';
import { Link } from 'wouter';

export default function Terms() {
  return (
    <>
      <SEO
        title="Terms of Service - ToolBox"
        description="The terms and conditions for using ToolBox's free online utilities."
      />

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>

        <div className="prose prose-slate dark:prose-invert prose-headings:font-display prose-headings:tracking-tight max-w-none">
          <p className="lead text-xl text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h2>Acceptance of Terms</h2>
          <p>
            By accessing or using ToolBox (the "Service"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use the Service.
          </p>

          <h2>Description of Service</h2>
          <p>
            ToolBox provides a collection of free, browser-based utilities for everyday calculations and text tasks. Tools run entirely on your device — no data you enter into a tool is transmitted to or stored on our servers. See our{' '}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for more detail.
          </p>

          <h2>Use of the Service</h2>
          <p>You agree to use ToolBox only for lawful purposes. You must not:</p>
          <ul>
            <li>Attempt to disrupt, overload, or interfere with the normal operation of the Service.</li>
            <li>Attempt to gain unauthorized access to any part of the Service or its underlying systems.</li>
            <li>Use automated means to scrape or systematically extract content from the Service in a way that degrades it for other users.</li>
          </ul>

          <h2>No Professional Advice</h2>
          <p>
            Results produced by our tools (including but not limited to calculators) are provided for general informational purposes only. They are not a substitute for professional medical, financial, legal, or other expert advice. Always consult a qualified professional for decisions that matter.
          </p>

          <h2>Service Availability</h2>
          <p>
            We aim to keep ToolBox available and reliable, but we do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the Service at any time without notice.
          </p>

          <h2>Disclaimer of Warranties</h2>
          <p>
            The Service is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the Service will be error-free, accurate, or fit for any particular purpose.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, ToolBox and its operators shall not be liable for any indirect, incidental, or consequential damages arising from your use of, or inability to use, the Service.
          </p>

          <h2>Changes to These Terms</h2>
          <p>
            We may update these Terms of Service from time to time. Changes will be posted on this page with an updated "Last updated" date. Continued use of the Service after changes are posted constitutes acceptance of the revised terms.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us through our{' '}
            <Link href="/contact" className="text-primary hover:underline">Contact page</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
