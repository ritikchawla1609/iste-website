import "../styles.css";

export const metadata = {
  title: "ISTE Society | Official Website",
  description:
    "Official website of the ISTE Student Chapter for chapter information, upcoming events, and recruitment notices.",
  icons: {
    icon: "/brand/iste-logo.jpg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
