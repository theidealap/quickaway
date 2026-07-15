import { z } from 'zod';

export type Category = 'Calculators' | 'Text Tools' | 'Converters' | 'Generators' | 'Other';

export interface ToolEntry {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription?: string;
  category: Category;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

import { lazy } from 'react';

export const toolsRegistry: ToolEntry[] = [
  {
    slug: 'age-calculator',
    name: 'Age Calculator',
    shortDescription: 'Calculate exact age in years, months, and days from a birth date.',
    longDescription: 'Find out exactly how old you are down to the day. You can also calculate your age on a specific date in the past or future.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/age-calculator'))
  },
  {
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    shortDescription: 'Quickly calculate percentages, increases, decreases, and ratios.',
    longDescription: 'A versatile calculator for working out percentages. Figure out X% of Y, what percentage X is of Y, or the percentage change between two numbers.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/percentage-calculator'))
  },
  {
    slug: 'word-counter',
    name: 'Word Counter',
    shortDescription: 'Count words, characters, sentences, and paragraphs in real-time.',
    longDescription: 'Paste or type your text to instantly see the number of words, characters (with and without spaces), sentences, and paragraphs.',
    category: 'Text Tools',
    component: lazy(() => import('@/tools/word-counter'))
  },
  {
    slug: 'bmi-calculator',
    name: 'BMI Calculator',
    shortDescription: 'Calculate your Body Mass Index from height and weight.',
    longDescription: 'Enter your height and weight in metric or imperial units to find your BMI and see which weight category it falls into.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/bmi-calculator'))
  },
  {
    slug: 'gpa-calculator',
    name: 'GPA Calculator',
    shortDescription: 'Calculate your GPA from course grades and credit hours.',
    longDescription: 'Add your courses with their grades and credit hours to instantly calculate your GPA on a 4.0 or 5.0 scale.',
    category: 'Calculators',
    component: lazy(() => import('@/tools/gpa-calculator'))
  },
  {
    slug: 'unit-converter',
    name: 'Unit Converter',
    shortDescription: 'Convert between length, weight, temperature, area, and volume units.',
    longDescription: 'Real-time conversion between common measurement units across length, weight, temperature, area, and volume, with a one-click swap.',
    category: 'Converters',
    component: lazy(() => import('@/tools/unit-converter'))
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    shortDescription: 'Generate a QR code from text, a URL, an email, or a phone number.',
    longDescription: 'Create a QR code from any text, website URL, email address, or phone number, then download it as a PNG in the size you need.',
    category: 'Generators',
    component: lazy(() => import('@/tools/qr-code-generator'))
  },
  {
    slug: 'whatsapp-link-generator',
    name: 'WhatsApp Link Generator',
    shortDescription: 'Create a direct WhatsApp chat link with an optional pre-filled message.',
    longDescription: 'Generate a shareable wa.me link (plus a scannable QR code) for a phone number, with an optional pre-filled welcome message.',
    category: 'Generators',
    component: lazy(() => import('@/tools/whatsapp-link-generator'))
  },
  {
    slug: 'email-signature-generator',
    name: 'Email Signature Generator',
    shortDescription: 'Build a professional HTML email signature with a live preview.',
    longDescription: 'Fill in your name, title, company, and contact details to generate a clean HTML email signature you can copy straight into your email client.',
    category: 'Generators',
    component: lazy(() => import('@/tools/email-signature-generator'))
  },
  {
    slug: 'countdown-to-date',
    name: 'Countdown to Date',
    shortDescription: 'Create a live countdown to any future date and time.',
    longDescription: 'Pick a target date and time to see a live countdown in days, hours, minutes, and seconds, with a shareable link to the same countdown.',
    category: 'Other',
    component: lazy(() => import('@/tools/countdown-to-date'))
  }
];
