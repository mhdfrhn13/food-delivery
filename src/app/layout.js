// src/app/layout.js
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Warung Tenji",
  description: "Pesan hidangan lezat dan autentik secara online.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased text-gray-900 bg-gray-50">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
