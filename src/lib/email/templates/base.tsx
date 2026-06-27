import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

/**
 * Shared shell for every transactional email. Header, footer, colors, spacing
 * and typography live ONLY here — individual emails supply their body. This is
 * what keeps the look consistent across all email types and provider changes.
 */

const brand = {
  primary: '#6c4ff5',
  text: '#0f0f0f',
  muted: '#6b7280',
  border: '#e5e7eb',
  bg: '#f4f4f7',
  card: '#ffffff',
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://langmaster.app'

export interface BaseLayoutProps {
  /** Inbox preview snippet. */
  preview: string
  children: React.ReactNode
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logo}>Bayyan</Text>
          </Section>

          <Section style={styles.card}>{children}</Section>

          <Hr style={styles.hr} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Bayyan — learn languages, live.
            </Text>
            <Text style={styles.footerText}>
              <Link href={appUrl} style={styles.footerLink}>
                {appUrl.replace(/^https?:\/\//, '')}
              </Link>
            </Text>
            <Text style={styles.footerMuted}>
              You received this email because you have a Bayyan account.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// --- Reusable building blocks (use these inside emails) --------------------

export function Heading({ children }: { children: React.ReactNode }) {
  return <Text style={styles.heading}>{children}</Text>
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>
}

export function Button({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Section style={styles.btnWrap}>
      <Link href={href} style={styles.btn}>
        {children}
      </Link>
    </Section>
  )
}

// --- Styles ----------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: brand.bg,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    margin: 0,
    padding: '24px 0',
  },
  container: { maxWidth: '560px', margin: '0 auto', padding: '0 16px' },
  header: { padding: '8px 0 16px' },
  logo: {
    color: brand.primary,
    fontSize: '22px',
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  card: {
    backgroundColor: brand.card,
    borderRadius: '12px',
    border: `1px solid ${brand.border}`,
    padding: '32px',
  },
  heading: {
    color: brand.text,
    fontSize: '20px',
    fontWeight: 700,
    margin: '0 0 16px',
  },
  paragraph: {
    color: brand.text,
    fontSize: '15px',
    lineHeight: '24px',
    margin: '0 0 16px',
  },
  btnWrap: { margin: '24px 0' },
  btn: {
    backgroundColor: brand.primary,
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    display: 'inline-block',
  },
  hr: { borderColor: brand.border, margin: '24px 0' },
  footer: { padding: '0 8px' },
  footerText: { color: brand.muted, fontSize: '13px', margin: '0 0 4px' },
  footerLink: { color: brand.primary, textDecoration: 'none' },
  footerMuted: { color: brand.muted, fontSize: '12px', margin: '8px 0 0' },
}
