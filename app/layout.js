import "./globals.css"

export const metadata = {
  title: "Saksham AI (सक्षम AI) | AI-Driven Scheme Matching for Marginalized Entrepreneurs",
  description: "Empowering SC, ST, OBC, Women, Rural Artisans, and PwD Entrepreneurs with AI-powered government scheme matching, subsidies (up to 45%), collateral-free credit, and application tracking.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
