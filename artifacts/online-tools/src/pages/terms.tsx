import { SEO } from '@/components/seo';
import { Link } from 'wouter';

export default function Terms() {
  return (
    <>
      <SEO
        title="Terms of Service - QuickAway"
        description="Terms and conditions for using QuickAway's free online calculators and utilities. Tools are provided as-is for informational purposes."
      />

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>

        <div className="prose prose-slate dark:prose-invert prose-headings:font-display prose-headings:tracking-tight max-w-none">
          <p className="lead text-xl text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h2>Acceptance of Terms</h2>
          <p>
            By using QuickAway (the "Service"), you agree to these Terms of Service. If you don't agree with them, please don't use the Service.
          </p>

          <h2>Description of Service</h2>
          <p>
            QuickAway is a collection of free, browser-based tools for everyday calculations and text tasks. Everything runs on your device — nothing you type into a tool is sent to or stored on our servers. See our{' '}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for details.
          </p>

          <h2>Use of the Service</h2>
          <p>When using QuickAway, please don't:</p>
          <ul>
            <li>Try to disrupt or overload the Service.</li>
            <li>Attempt to gain unauthorized access to the Service or its underlying systems.</li>
            <li>Scrape or extract content from the Service in a way that degrades it for other users.</li>
          </ul>

          <h2>No Professional Advice</h2>
          <p>
            Results from our tools, including calculators, are for general informational purposes only and aren't a substitute for professional medical, financial, or legal advice. For decisions that matter, consult a qualified professional.
          </p>

          <h2>Service Availability</h2>
          <p>
            We aim to keep QuickAway available and reliable, but we can't guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the Service at any time.
          </p>

          <h2>Disclaimer of Warranties</h2>
          <p>
            The Service is provided "as is," without warranties of any kind. We don't guarantee it will always be error-free or accurate.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            To the extent permitted by law, QuickAway and its operators aren't liable for damages arising from your use of, or inability to use, the Service.
          </p>

          <h2>Changes to These Terms</h2>
          <p>
            We may update these terms from time to time. Changes will be posted here with an updated "Last updated" date. Continuing to use the Service after an update means you accept the revised terms.
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
