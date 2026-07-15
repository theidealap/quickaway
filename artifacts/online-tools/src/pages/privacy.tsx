import { SEO } from '@/components/seo';
import { Link } from 'wouter';

export default function Privacy() {
  return (
    <>
      <SEO 
        title="Privacy Policy - ToolBox" 
        description="Our privacy policy. Learn how ToolBox handles your data (spoiler: we don't collect it)."
      />
      
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate dark:prose-invert prose-headings:font-display prose-headings:tracking-tight max-w-none">
          <p className="lead text-xl text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h2>The Short Version</h2>
          <p>
            <strong>We do not collect, store, or share the data you enter into our tools.</strong>
          </p>
          <p>
            ToolBox is designed as a suite of client-side utilities. When you calculate an age, count words, or determine a percentage, all processing happens locally within your web browser. The text, numbers, and dates you input never leave your device and are never sent to our servers.
          </p>

          <h2>Data We Do Collect</h2>
          <p>
            While we don't collect the data you put into our tools, we do collect standard web analytics to understand how our site is used. This includes:
          </p>
          <ul>
            <li>Basic analytics data (page views, browser type, referring sites)</li>
            <li>Error logs (if the site crashes, we might receive an anonymous crash report)</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We use minimal cookies. We may use local storage in your browser to save your preferences (like dark mode toggle), but this data remains on your device.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            We may use third-party analytics services (such as Google Analytics or Plausible) to monitor and analyze the use of our service. These services have their own privacy policies addressing how they use such information.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through our{' '}
            <Link href="/contact" className="text-primary hover:underline">Contact page</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
