// src/app/kontak/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { client } from "../../sanity/lib/client";

export default function HalamanKontak() {
  // State form kini hanya berisi nama dan pesan (tanpa email)
  const [form, setForm] = useState({ nama: "", pesan: "" });

  // State untuk menyimpan data kontak dari Sanity
  const [infoKontak, setInfoKontak] = useState({
    alamat: "Memuat alamat...",
    whatsapp: "Memuat nomor...",
    jam: "Memuat jam operasional...",
  });

  // Fetch data dari Sanity saat halaman dimuat
  useEffect(() => {
    const fetchPengaturan = async () => {
      try {
        const query = '*[_type == "pengaturan"][0]';
        const data = await client.fetch(query);
        if (data) {
          setInfoKontak({
            alamat: data.alamatToko || "Belum ada alamat yang diatur.",
            whatsapp: data.nomorWhatsapp || "6285365968845", // Fallback ke nomor default jika kosong
            jam:
              data.jamOperasional || "Belum ada jam operasional yang diatur.",
          });
        }
      } catch (error) {
        console.error("Gagal memuat info kontak:", error);
      }
    };
    fetchPengaturan();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Fungsi pengiriman form langsung ke WhatsApp
  const handleSubmit = (e) => {
    e.preventDefault();

    // Membersihkan nomor WA dari karakter selain angka (untuk berjaga-jaga)
    const nomorTujuan = infoKontak.whatsapp.replace(/\D/g, "");

    // Memformat kerangka pesan
    let teksPesan = `*PESAN DARI HALAMAN KONTAK*\n\n`;
    teksPesan += `*Nama:* ${form.nama}\n`;
    teksPesan += `*Pesan:*\n${form.pesan}`;

    // Membuka tab baru menuju WhatsApp
    window.open(
      `https://wa.me/${nomorTujuan}?text=${encodeURIComponent(teksPesan)}`,
      "_blank",
    );

    // Mengosongkan form setelah dialihkan
    setForm({ nama: "", pesan: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:py-12 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition"
          >
            &larr; Kembali ke Beranda
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Hubungi Kami</h1>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Punya pertanyaan, saran, atau ingin melakukan pemesanan dalam jumlah
            besar untuk acara khusus? Hubungi kami melalui form di bawah atau
            kontak yang tersedia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* INFORMASI KONTAK DINAMIS */}
          <div className="p-8 md:p-12 bg-orange-600 text-white flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-6">Informasi Kontak</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Alamat Kami</h3>
                  <p className="text-orange-100 mt-1 whitespace-pre-line">
                    {infoKontak.alamat}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">WhatsApp / Telepon</h3>
                  <p className="text-orange-100 mt-1">+{infoKontak.whatsapp}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Jam Operasional</h3>
                  <p className="text-orange-100 mt-1">{infoKontak.jam}</p>
                </div>
              </div>
            </div>
          </div>

          {/* FORM KONTAK KE WHATSAPP */}
          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-bold mb-6">Kirim Pesan</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama"
                  required
                  value={form.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama Anda"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pesan
                </label>
                <textarea
                  name="pesan"
                  required
                  rows="5"
                  value={form.pesan}
                  onChange={handleChange}
                  placeholder="Tulis pertanyaan atau saran Anda di sini..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#25D366] text-white font-bold py-3 rounded-lg hover:bg-[#1ebe57] transition shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                {/* Ikon WhatsApp */}
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12c0 2.17.69 4.18 1.87 5.82L3 21l3.18-.87C7.82 21.31 9.83 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.3 13.6c-.22.62-1.3.1.2.62.6-.08 1.15-.4 1.34-1.28.18-1.5.87-2.34.87-2.34-.14-.23-.5-.38-1.04-.64l-2.32-1.16c-.52-.27-.9-.4-1.28.16-.37.58-.75 1.17-.92 1.4-.17.24-.35.26-.87.02-2.12-1.02-3.32-2.02-4.63-3.92-.22-.32-.02-.5.15-.65.15-.14.34-.4.5-.6.18-.2.23-.33.35-.56.12-.23.05-.44-.04-.62-.1-.2-1.26-3.04-1.73-4.16-.45-1.1-.92-.95-1.28-.95-.35 0-.75-.04-1.16-.04-.4 0-1.04.15-1.58.74C3.86 7.33 2.7 8.5 2.7 10.87c0 2.37 1.42 4.67 1.62 4.94.2.27 3.32 5.18 8.13 7.15 4.8 1.97 4.8 1.32 5.67 1.25z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Kirim via WhatsApp
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
