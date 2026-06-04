// src/app/page.js
import Link from "next/link";
import { client, urlFor } from "../sanity/lib/client";

// Mengatur halaman ini agar divalidasi ulang (revalidate) setiap 60 detik jika ada menu baru
export const revalidate = 60;

export default async function Beranda() {
  // Mengambil 3 menu pertama dari Sanity untuk dijadikan "Menu Unggulan"
  const query = '*[_type == "menu" && isFeatured == true][0...3]';
  const menuUnggulan = await client.fetch(query);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-orange-600 text-white overflow-hidden">
        {/* Dekorasi Background Tambahan (Opsional) */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Sajian Autentik,
            <br className="hidden md:block" /> Rasa Bintang Lima
          </h1>
          <p className="text-lg md:text-xl text-orange-100 mb-10 max-w-2xl">
            Nikmati berbagai hidangan lezat yang dimasak dengan bahan segar
            pilihan dan resep rahasia keluarga. Pesan sekarang dan rasakan
            kenikmatannya!
          </p>

          {/* TOMBOL CALL-TO-ACTION (CTA) */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/pemesanan"
              className="bg-white text-orange-600 font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              Pesan Sekarang
            </Link>
            <Link
              href="/kontak"
              className="bg-transparent border-2 border-white text-white font-bold text-lg px-8 py-3 rounded-full hover:bg-white hover:text-orange-600 transition-all duration-300 flex items-center justify-center"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SECTION MENU UNGGULAN ================= */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Menu Unggulan Kami
          </h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full"></div>
          <p className="text-gray-500 mt-4">
            Pilihan hidangan favorit pelanggan yang wajib Anda coba.
          </p>
        </div>

        {menuUnggulan.length === 0 ? (
          <p className="text-center text-gray-500">
            Menu unggulan belum tersedia.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {menuUnggulan.map((menu) => {
              const isTersedia = menu.tersedia !== false;

              return (
                <div
                  key={menu._id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col"
                >
                  {/* Gambar Menu */}
                  <div className="relative h-56 w-full">
                    <img
                      src={
                        menu.gambar
                          ? urlFor(menu.gambar).url()
                          : "https://via.placeholder.com/400"
                      }
                      alt={menu.nama}
                      className="w-full h-full object-cover"
                    />
                    {!isTersedia && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-600 text-white font-bold px-4 py-1 rounded-full shadow-lg">
                          HABIS
                        </span>
                      </div>
                    )}
                    {/* Badge Kategori */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-orange-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {menu.kategori}
                    </div>
                  </div>

                  {/* Detail Menu */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {menu.nama}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                      {menu.deskripsi || "Hidangan lezat spesial untuk Anda."}
                    </p>

                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                      <span className="text-lg font-bold text-orange-600">
                        Rp {menu.harga.toLocaleString("id-ID")}
                      </span>
                      <Link
                        href="/pemesanan"
                        className="text-sm font-semibold text-orange-500 hover:text-orange-700 transition-colors"
                      >
                        Beli &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/pemesanan"
            className="inline-block border border-orange-500 text-orange-600 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors"
          >
            Lihat Semua Menu
          </Link>
        </div>
      </section>

      {/* ================= FOOTER SEDERHANA ================= */}
      <footer className="bg-gray-800 text-gray-300 py-8 text-center text-sm">
        <p>
          &copy; {new Date().getFullYear()} Rumah Makan Kami. Hak Cipta
          Dilindungi.
        </p>
      </footer>
    </div>
  );
}
