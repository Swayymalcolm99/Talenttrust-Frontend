'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import nav from '@/lib/nav.json';
import { WalletButton } from './wallet/WalletButton';

export function Header() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo" aria-label="TalentTrust home">
          <span className="logo-mark">TT</span>
          TalentTrust
        </Link>
        <nav className="nav" aria-label="Main">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
          <Link href="/contracts" className="btn btn-primary btn-sm" style={{ marginLeft: 8, color: 'var(--brand-ink)' }}>
            Launch app
          </Link>
          <WalletButton />
        </nav>
        <details className="menu" ref={menu}>
          <summary aria-label="Open menu">Menu</summary>
          <div className="menu-panel">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined}>
                {item.label}
              </Link>
            ))}
            <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)' }}>
              <WalletButton />
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
