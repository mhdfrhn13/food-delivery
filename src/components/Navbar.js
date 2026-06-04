// src/components/Navbar.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();

  // Menyembunyikan navbar di halaman studio Sanity agar tidak menimpa UI CMS
  if (pathname.startsWith("/studio")) return null;

  const navLinks = [
    { name: "Beranda", path: "/" },
    { name: "Pesan Menu", path: "/pemesanan" },
    { name: "Kontak", path: "/kontak" },
  ];

  // Membaca dan mensinkronisasi jumlah item di keranjang
  useEffect(() => {
    const updateCartCount = () => {
      const keranjangTersimpan = localStorage.getItem("rm_keranjang_belanja");
      if (keranjangTersimpan) {
        try {
          const parsed = JSON.parse(keranjangTersimpan);
          const count = parsed.reduce((total, item) => total + item.jumlah, 0);
          setCartCount(count);
        } catch (e) {
          console.error(e);
        }
      } else {
        setCartCount(0);
      }
    };

    updateCartCount(); // Eksekusi saat mount
    window.addEventListener("cartUpdated", updateCartCount); // Listener untuk tab yang sama
    window.addEventListener("storage", updateCartCount); // Listener untuk tab berbeda

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-orange-600 tracking-tighter">
              Warung Tenji<span className="text-gray-800">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-orange-600"
                      : "text-gray-600 hover:text-orange-500"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action Area: Cart & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link
              href="/pemesanan"
              className="relative p-2 text-gray-600 hover:text-orange-600 transition"
              aria-label="Keranjang"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full transform translate-x-1 -translate-y-1">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4 shadow-lg absolute w-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-base font-semibold ${
                  isActive ? "text-orange-600" : "text-gray-700"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
