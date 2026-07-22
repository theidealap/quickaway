import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/',              label: 'Tools'   },
  { href: '/guides',        label: 'Guides'  },
  { href: '/about',         label: 'About'   },
  { href: '/contact',       label: 'Contact' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const handleNav = (href: string) => {
    setLocation(href);
    setOpen(false);
  };

  const isActive = (href: string) =>
    href === '/' ? location === '/' : location.startsWith(href);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo — plain wordmark, no colored square */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              Tool<span className="text-primary">Box</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-3 py-1.5 rounded text-sm font-medium transition-colors
                  ${isActive(link.href)
                    ? 'text-foreground bg-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden absolute w-full top-14 left-0 bg-background border-b border-border shadow-sm z-50">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className={`
                  w-full text-left px-3 py-2.5 rounded text-sm font-medium transition-colors
                  ${isActive(link.href)
                    ? 'text-foreground bg-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }
                `}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
