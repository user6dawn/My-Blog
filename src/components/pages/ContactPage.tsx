import React, { useState } from 'react';
import Layout from '@/components/Layout';
import '@/styles/styles.css'; // Ensure global styles are imported
import { Mail, Phone, ExternalLink, Copy, Check } from 'lucide-react';

const PHONE_DISPLAY = '+234 704 222 4426';
const PHONE_LINK = 'tel:+2347042224426';
const EMAIL = 'phenomenalafricans@gmail.com';

const SOCIALS = [
  {
    name: 'YouTube',
    handle: '@africa-x6f',
    href: 'https://youtube.com/@africa-x6f?si=OKKUsX4ouGYEJbeB',
    hover: 'group-hover:bg-red-600 group-hover:text-white',
  },
  {
    name: 'TikTok',
    handle: '@africanfame1',
    href: 'https://www.tiktok.com/@africanfame1?_r=1&_t=ZS-93dHLlrYiDR',
    hover: 'group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-zinc-900',
  },
  {
    name: 'Facebook',
    handle: 'Our page',
    href: 'https://www.facebook.com/share/1CtJjXsZWa/?mibextid=wwXIfr',
    hover: 'group-hover:bg-blue-600 group-hover:text-white',
  },
];

const ContactPage: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the mailto link still works.
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 md:py-16">
        {/* Header */}
        <header className="mb-12 md:mb-20 max-w-3xl">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.95] text-zinc-950 dark:text-white">
            Get in touch
          </h1>
          <p className="mt-5 text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
            Call, email, or find us on social media. We'll get back to you as soon as we can.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Direct contact */}
          <section aria-labelledby="direct-heading">
            <h2
              id="direct-heading"
              className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800"
            >
              Reach us directly
            </h2>

            <ul>
              <li className="border-b border-zinc-200 dark:border-zinc-800">
                <a
                  href={PHONE_LINK}
                  className="group flex items-center gap-5 py-6 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white rounded-lg"
                >
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-200">
                    <Phone size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-zinc-500 dark:text-zinc-400">Phone</span>
                    <span className="block text-xl md:text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                      {PHONE_DISPLAY}
                    </span>
                  </span>
                </a>
              </li>

              <li className="border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3 py-6">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="group flex min-w-0 flex-1 items-center gap-5 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white rounded-lg"
                  >
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-200">
                      <Mail size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm text-zinc-500 dark:text-zinc-400">Email</span>
                      <span className="block break-all text-xl md:text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                        {EMAIL}
                      </span>
                    </span>
                  </a>

                  <button
                    type="button"
                    onClick={copyEmail}
                    aria-label={copied ? 'Email address copied' : 'Copy email address'}
                    className="flex h-10 flex-none items-center gap-2 rounded-full border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus-visible:ring-white"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </li>
            </ul>
          </section>

          {/* Social */}
          <section aria-labelledby="social-heading">
            <h2
              id="social-heading"
              className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white pb-4 border-b border-zinc-200 dark:border-zinc-800"
            >
              Follow us
            </h2>

            <ul>
              {SOCIALS.map((social) => (
                <li key={social.name} className="border-b border-zinc-200 dark:border-zinc-800">
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.name} (opens in a new tab)`}
                    className="group flex items-center justify-between gap-4 py-6 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white rounded-lg"
                  >
                    <span className="min-w-0">
                      <span className="block text-xl md:text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white transition-transform duration-300 group-hover:translate-x-1">
                        {social.name}
                      </span>
                      <span className="block text-sm text-zinc-500 dark:text-zinc-400">
                        {social.handle}
                      </span>
                    </span>
                    <span
                      className={`flex h-12 w-12 flex-none items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-colors duration-300 dark:bg-zinc-800 dark:text-zinc-200 ${social.hover}`}
                    >
                      <ExternalLink size={18} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;