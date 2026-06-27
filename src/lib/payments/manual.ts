// Manual payment details shown to students until a real gateway is integrated.
// Students pay via Easypaisa / JazzCash and send a screenshot on WhatsApp; an
// admin then verifies the payment from the admin enrollments page.
//
// TODO: replace placeholders with real accounts, or set these NEXT_PUBLIC_ env
// vars in .env.local (must be NEXT_PUBLIC_ so the client checkout page can read them).

export const MANUAL_PAYMENT = {
  easypaisa: {
    accountName: process.env.NEXT_PUBLIC_EASYPAISA_NAME ?? 'Bayyan',
    accountNumber: process.env.NEXT_PUBLIC_EASYPAISA_NUMBER ?? '03XX-XXXXXXX',
  },
  jazzcash: {
    accountName: process.env.NEXT_PUBLIC_JAZZCASH_NAME ?? 'Bayyan',
    accountNumber: process.env.NEXT_PUBLIC_JAZZCASH_NUMBER ?? '03XX-XXXXXXX',
  },
  // International format, digits only (e.g. 923001234567) for the wa.me link.
  whatsappNumber: process.env.NEXT_PUBLIC_PAYMENT_WHATSAPP ?? '923001234567',
}

// Build a wa.me link with a prefilled message.
export function whatsappLink(message: string): string {
  const digits = MANUAL_PAYMENT.whatsappNumber.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
