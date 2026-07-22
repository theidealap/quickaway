import { SEO } from '@/components/seo';
import { Link } from 'wouter';

export default function Privacy() {
  return (
    <>
      <SEO
        title="Privacy Policy - QuickAway"
        description="QuickAway does not collect or store any data you enter into its tools. All calculations run locally in your browser. Read our full privacy policy."
      />
      
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate dark:prose-invert prose-headings:font-display prose-headings:tracking-tight max-w-none">
          <p className="lead text-xl text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h2>The Short Version</h2>
          <p>
            <strong>We don't collect, store, or share the data you enter into our tools.</strong>
          </p>
          <p>
            QuickAway's tools run entirely in your browser. When you calculate an age, count words, or work out a percentage, that processing happens on your device — the numbers, text, and dates you enter never reach our servers.
          </p>

          <h2>Data We Do Collect</h2>
          <p>
            We collect basic web analytics to understand how the site is used, such as:
          </p>
          <ul>
            <li>Page views, browser type, and referring sites</li>
            <li>Anonymous error/crash reports if something breaks</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We use minimal cookies. We may use your browser's local storage to remember preferences like dark mode, but that stays on your device.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            We use <strong>Vercel Analytics</strong> to understand site usage (page views, browser type, and referring sites). Vercel Analytics is privacy-focused: it does not use cookies, does not track individuals across sites, and does not sell data.{' '}
            <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Vercel's privacy policy</a> covers how this data is handled.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            If we update this policy, we'll post the changes here with a new "Last updated" date. Check back occasionally if you want to stay current.
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
