import { Link } from 'wouter';
import { CATEGORY_SLUGS, type Category } from '@/lib/tools-registry';
import { guidesRegistry } from '@/lib/guides-registry';

const categories: Category[] = [
  'Calculators',
  'Converters',
  'Generators',
  'Text Tools',
  'Developer Tools',
  'Date & Time',
];

const popularTools = [
  { slug: 'age-calculator',        name: 'Age Calculator'        },
  { slug: 'bmi-calculator',        name: 'BMI Calculator'        },
  { slug: 'percentage-calculator', name: 'Percentage Calculator' },
  { slug: 'qr-code-generator',     name: 'QR Code Generator'     },
  { slug: 'word-counter',          name: 'Word Counter'          },
];

const footerGuides = guidesRegistry.slice(0, 4);

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="inline-block mb-3">
              <span className="font-display font-bold text-base tracking-tight text-foreground">
                Tool<span className="text-primary">Box</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Free browser-based utilities for everyday calculations, conversions, and text tasks.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
              Categories
            </h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/${CATEGORY_SLUGS[cat]}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Tools */}
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
              Popular Tools
            </h3>
            <ul className="space-y-2">
              {popularTools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guides + Legal */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
                Guides
              </h3>
              <ul className="space-y-2">
                {footerGuides.map((guide) => (
                  <li key={guide.slug}>
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {guide.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/guides"
                    className="text-sm text-primary hover:underline underline-offset-4"
                  >
                    All guides →
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
                Company
              </h3>
              <ul className="space-y-2">
                <li><Link href="/about"   className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms"   className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ToolBox. All rights reserved.</p>
          <p>Free tools. No sign-up. No tracking.</p>
        </div>
      </div>
    </footer>
  );
}
