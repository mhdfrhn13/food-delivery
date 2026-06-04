// src/app/pemesanan/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { client, urlFor } from "../../sanity/lib/client";

import MenuCard from "../../components/MenuCard";
import CartItem from "../../components/CartItem";
import CheckoutForm from "../../components/CheckoutForm";
import Toast from "../../components/Toast";
import { formatRupiah } from "../../utils/format";

export default function HalamanPemesanan() {
  // 1. STATE UNTUK DATA DARI SANITY
  const [menuMakanan, setMenuMakanan] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [qrisImageUrl, setQrisImageUrl] = useState("");
  const [nomorAdmin, setNomorAdmin] = useState("6285365968845");

  // 2. STATE UNTUK KERANJANG & KATEGORI
  const [keranjang, setKeranjang] = useState([]);
  const [kategoriTerpilih, setKategoriTerpilih] = useState("Semua");
  const [isClient, setIsClient] = useState(false);

  // --- STATE BARU: BOTTOM SHEET KERANJANG (MOBILE) ---
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);

  // 3. STATE UNTUK FORM CHECKOUT
  const [form, setForm] = useState({
    namaPemesan: "",
    alamat: "",
    catatan: "",
    metodePembayaran: "Cash",
  });
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({ pesan: "", tampil: false });

  // 4. STATE UNTUK FITUR PROMO/VOUCHER
  const [inputKode, setInputKode] = useState("");
  const [promoTerpakai, setPromoTerpakai] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [loadingPromo, setLoadingPromo] = useState(false);

  const daftarKategori = ["Semua", "Makanan", "Minuman", "Cemilan"];

  // ==========================================
  // A. MENGUNCI SCROLL BACKGROUND SAAT BOTTOM SHEET TERBUKA
  // ==========================================
  useEffect(() => {
    if (isCartSheetOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden"; // Mencegah scroll di daftar menu
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartSheetOpen]);

  // ==========================================
  // B. FETCH DATA MENU & PENGATURAN QRIS (SANITY)
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryMenu = '*[_type == "menu"] | order(_createdAt asc)';
        const dataMenu = await client.fetch(queryMenu);
        const formattedData = dataMenu.map((item) => ({
          id: item._id,
          nama: item.nama,
          deskripsi: item.deskripsi || "",
          kategori: item.kategori,
          harga: item.harga,
          gambar: item.gambar
            ? urlFor(item.gambar).url()
            : "https://via.placeholder.com/400",
          tersedia: item.tersedia,
        }));
        setMenuMakanan(formattedData);

        const queryPengaturan = '*[_type == "pengaturan"][0]';
        const dataPengaturan = await client.fetch(queryPengaturan);
        if (dataPengaturan) {
          // Tangkap gambar QRIS
          if (dataPengaturan.gambarQris) {
            setQrisImageUrl(urlFor(dataPengaturan.gambarQris).url());
          }
          // Tangkap nomor WA Admin yang baru kita buat
          if (dataPengaturan.nomorWhatsapp) {
            setNomorAdmin(dataPengaturan.nomorWhatsapp);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data dari Sanity:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // ==========================================
  // C. PENGELOLAAN LOCAL STORAGE UNTUK KERANJANG
  // ==========================================
  useEffect(() => {
    setIsClient(true);
    const keranjangTersimpan = localStorage.getItem("rm_keranjang_belanja");
    if (keranjangTersimpan) {
      try {
        setKeranjang(JSON.parse(keranjangTersimpan));
      } catch (error) {
        console.error("Gagal memuat keranjang", error);
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("rm_keranjang_belanja", JSON.stringify(keranjang));
      window.dispatchEvent(new Event("cartUpdated")); // Memicu Global Navbar Update (jika ada)
    }
  }, [keranjang, isClient]);

  // ==========================================
  // D. FUNGSI INTERAKSI KERANJANG
  // ==========================================
  const tampilkanToast = (pesan) => {
    setToast({ pesan, tampil: true });
    setTimeout(() => setToast({ pesan: "", tampil: false }), 2500);
  };

  const tambahKeKeranjang = (makanan) => {
    const itemAda = keranjang.find((item) => item.id === makanan.id);
    if (itemAda) {
      setKeranjang(
        keranjang.map((item) =>
          item.id === makanan.id ? { ...item, jumlah: item.jumlah + 1 } : item,
        ),
      );
    } else {
      setKeranjang([...keranjang, { ...makanan, jumlah: 1 }]);
    }
    tampilkanToast(`${makanan.nama} ditambahkan!`);
  };

  const kurangiDariKeranjang = (id) => {
    const itemAda = keranjang.find((item) => item.id === id);
    if (itemAda.jumlah === 1) {
      setKeranjang(keranjang.filter((item) => item.id !== id));
      // Jika keranjang kosong, tutup bottom sheet otomatis
      if (keranjang.length === 1) setIsCartSheetOpen(false);
    } else {
      setKeranjang(
        keranjang.map((item) =>
          item.id === id ? { ...item, jumlah: item.jumlah - 1 } : item,
        ),
      );
    }
  };

  const hapusDariKeranjang = (id) => {
    setKeranjang(keranjang.filter((item) => item.id !== id));
    if (keranjang.length === 1) setIsCartSheetOpen(false);
  };

  const sampleHapusSemuaItem = () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan keranjang?")) {
      setKeranjang([]);
      setPromoTerpakai(null);
      setIsCartSheetOpen(false);
      tampilkanToast("Keranjang dikosongkan.");
    }
  };

  // ==========================================
  // E. FUNGSI PROMO & KALKULASI HARGA TOTAL
  // ==========================================
  const totalHarga = keranjang.reduce(
    (total, item) => total + item.harga * item.jumlah,
    0,
  );
  const totalItem = keranjang.reduce((total, item) => total + item.jumlah, 0);

  const klaimVoucher = async () => {
    if (!inputKode.trim()) return;
    setLoadingPromo(true);
    setPromoError("");

    try {
      const query = `*[_type == "promo" && kodeVoucher == $kode && statusAktif == true][0]`;
      const dataPromo = await client.fetch(query, {
        kode: inputKode.toUpperCase().trim(),
      });

      if (!dataPromo) {
        setPromoError("Kode voucher tidak valid atau sudah tidak aktif.");
        setPromoTerpakai(null);
      } else if (totalHarga < dataPromo.minimalPembelian) {
        setPromoError(
          `Minimal pembelian untuk voucher ini adalah ${formatRupiah(dataPromo.minimalPembelian)}`,
        );
        setPromoTerpakai(null);
      } else {
        setPromoTerpakai(dataPromo);
        setPromoError("");
        setInputKode("");
        tampilkanToast(`Voucher ${dataPromo.kodeVoucher} terpasang!`);
      }
    } catch (error) {
      console.error("Gagal memvalidasi voucher:", error);
      setPromoError("Terjadi kesalahan sistem.");
    } finally {
      setLoadingPromo(false);
    }
  };

  const hitungPotongan = () => {
    if (!promoTerpakai) return 0;
    if (promoTerpakai.tipeDiskon === "nominal")
      return promoTerpakai.nilaiDiskon;
    if (promoTerpakai.tipeDiskon === "persentase") {
      let potongan = (totalHarga * promoTerpakai.nilaiDiskon) / 100;
      if (
        promoTerpakai.maksimalPotongan &&
        potongan > promoTerpakai.maksimalPotongan
      ) {
        potongan = promoTerpakai.maksimalPotongan;
      }
      return potongan;
    }
    return 0;
  };

  const totalPotongan = hitungPotongan();
  const totalAkhirBayar =
    totalHarga - totalPotongan > 0 ? totalHarga - totalPotongan : 0;

  useEffect(() => {
    if (promoTerpakai && totalHarga < promoTerpakai.minimalPembelian) {
      setPromoTerpakai(null);
      setPromoError(
        `Voucher otomatis dibatalkan: pesanan kurang dari ${formatRupiah(promoTerpakai.minimalPembelian)}`,
      );
    }
  }, [totalHarga, promoTerpakai]);

  // ==========================================
  // F. FUNGSI CHECKOUT KE WHATSAPP
  // ==========================================
  const checkoutWhatsApp = () => {
    let errors = {};
    if (keranjang.length === 0) return alert("Keranjang masih kosong!");
    if (!form.namaPemesan.trim()) errors.namaPemesan = "Wajib diisi!";
    if (!form.alamat.trim()) errors.alamat = "Wajib diisi!";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const nomorWA = nomorAdmin;

    let pesan = `*PESANAN BARU - RUMAH MAKAN*\n\n*Detail Pengiriman:*\n• Nama Pemesan: ${form.namaPemesan}\n• Alamat Lengkap: ${form.alamat}\n• Metode Pembayaran: *${form.metodePembayaran}*\n`;
    if (form.catatan.trim()) pesan += `• Catatan: ${form.catatan}\n`;
    if (promoTerpakai)
      pesan += `• Voucher Digunakan: *${promoTerpakai.kodeVoucher}*\n`;

    pesan += `\n*Daftar Pesanan:*\n`;
    keranjang.forEach((item) => {
      pesan += `- ${item.nama} (${item.jumlah}x) : ${formatRupiah(item.harga * item.jumlah)}\n`;
    });

    if (promoTerpakai) {
      pesan += `\nSubtotal: ${formatRupiah(totalHarga)}`;
      pesan += `\nDiskon Kupon: -${formatRupiah(totalPotongan)}`;
    }
    pesan += `\n*Total Pembayaran: ${formatRupiah(totalAkhirBayar)}*\n\nTerima kasih!`;

    window.open(
      `https://wa.me/${nomorWA}?text=${encodeURIComponent(pesan)}`,
      "_blank",
    );
  };

  const menuTersaring = menuMakanan.filter((menu) =>
    kategoriTerpilih === "Semua" ? true : menu.kategori === kategoriTerpilih,
  );

  // ==========================================
  // G. RENDERING TAMPILAN (UI)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24 md:pb-6 font-sans relative">
      <Toast pesan={toast.pesan} tampil={toast.tampil} />

      {/* Tombol Navigasi Manual Khusus Jika Tidak Menggunakan Global Navbar */}
      <div className="max-w-5xl mx-auto mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition"
        >
          &larr; Kembali ke Beranda
        </Link>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* === AREA KIRI: DAFTAR MENU === */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Menu Rumah Makan
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Silakan pilih kategori hidangan favorit Anda
          </p>

          {/* STICKY CATEGORY FILTER (Mendukung Geser Horizontal di Mobile) */}
          <div className="sticky top-16 z-30 bg-gray-50/95 backdrop-blur-md py-3 mb-6 flex overflow-x-auto hide-scrollbar gap-2 border-b border-gray-200/50 md:border-none">
            {daftarKategori.map((kategori) => (
              <button
                key={kategori}
                onClick={() => setKategoriTerpilih(kategori)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  kategoriTerpilih === kategori
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {kategori}
              </button>
            ))}
          </div>

          {loadingData ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-gray-500 font-medium animate-pulse">
                Memuat menu spesial hari ini...
              </p>
            </div>
          ) : menuTersaring.length === 0 ? (
            <p className="text-gray-500 text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              Menu untuk kategori "{kategoriTerpilih}" belum tersedia.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {menuTersaring.map((menu) => {
                // Mengecek apakah menu ini sudah ada di dalam keranjang
                const itemDiKeranjang = keranjang.find(
                  (item) => item.id === menu.id,
                );
                const jumlahPesanan = itemDiKeranjang
                  ? itemDiKeranjang.jumlah
                  : 0;

                return (
                  <MenuCard
                    key={menu.id}
                    menu={menu}
                    jumlahPesanan={jumlahPesanan} // Mengirimkan jumlah pesanan saat ini
                    onTambahKeranjang={tambahKeKeranjang}
                    onKurangKeranjang={kurangiDariKeranjang} // Mengirimkan fungsi untuk mengurangi
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* === AREA KANAN / BOTTOM SHEET: KERANJANG BELANJA & CHECKOUT === */}
        {/* ============================================================== */}

        {/* BACKDROP GELAP (Hanya Muncul di Mobile Saat Sheet Terbuka) */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ${
            isCartSheetOpen
              ? "opacity-100 visible"
              : "opacity-0 invisible pointer-events-none"
          }`}
          onClick={() => setIsCartSheetOpen(false)}
        ></div>

        <div
          id="area-keranjang"
          className={`
            fixed inset-x-0 bottom-0 z-50 bg-white p-6 rounded-t-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.15)] 
            max-h-[85vh] overflow-y-auto transform transition-transform duration-300 ease-in-out
            md:static md:translate-y-0 md:rounded-xl md:shadow-md md:h-fit md:sticky md:top-24 md:max-h-[calc(100vh-6rem)] md:z-10
            ${isCartSheetOpen ? "translate-y-0" : "translate-y-full"}
          `}
        >
          {/* Header Mobile Bottom Sheet dengan Handle Bar & Tombol Tutup */}
          <div className="md:hidden flex justify-center mb-4">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>

          <div className="flex justify-between items-center mb-6 border-b pb-4 md:border-none md:pb-0">
            <h2 className="text-2xl font-bold text-gray-800">Keranjang Anda</h2>
            <div className="flex items-center gap-4">
              {keranjang.length > 0 && (
                <button
                  onClick={sampleHapusSemuaItem}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold underline transition"
                >
                  Kosongkan
                </button>
              )}
              {/* Tombol Tutup X Khusus Mobile */}
              <button
                onClick={() => setIsCartSheetOpen(false)}
                className="md:hidden bg-gray-100 p-2 rounded-full text-gray-500 hover:text-gray-800 focus:outline-none"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          {!isClient ? (
            <p className="text-gray-400 text-center py-4 text-sm animate-pulse">
              Memuat keranjang...
            </p>
          ) : keranjang.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center">
              <svg
                className="w-16 h-16 text-gray-200 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                ></path>
              </svg>
              <p className="text-gray-500 font-medium">
                Keranjang masih kosong.
              </p>
              <button
                onClick={() => setIsCartSheetOpen(false)}
                className="mt-4 md:hidden text-orange-600 font-semibold border border-orange-600 px-4 py-2 rounded-full text-sm"
              >
                Mulai Memesan
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {keranjang.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onTambah={tambahKeKeranjang}
                    onKurang={kurangiDariKeranjang}
                    onHapus={hapusDariKeranjang}
                  />
                ))}
              </div>

              {/* FORM CHECKOUT */}
              <CheckoutForm
                form={form}
                setForm={setForm}
                errors={formErrors}
                qrisUrl={qrisImageUrl}
              />

              <div className="pt-4 border-t border-gray-200">
                {/* --- INPUT KODE PROMO --- */}
                {!promoTerpakai ? (
                  <div className="flex flex-col gap-2 mb-4">
                    <label className="text-sm font-medium text-gray-700">
                      Punya Kode Voucher?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputKode}
                        onChange={(e) =>
                          setInputKode(e.target.value.toUpperCase())
                        }
                        placeholder="Masukkan Kode"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none uppercase"
                      />
                      <button
                        onClick={klaimVoucher}
                        disabled={loadingPromo}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition disabled:bg-gray-400"
                      >
                        {loadingPromo ? "..." : "Pakai"}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-red-500 mt-1">{promoError}</p>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-xs text-green-800 font-bold">
                        Voucher Terpasang:
                      </p>
                      <p className="text-sm text-green-700 font-semibold">
                        {promoTerpakai.kodeVoucher}
                      </p>
                    </div>
                    <button
                      onClick={() => setPromoTerpakai(null)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold underline"
                    >
                      Hapus
                    </button>
                  </div>
                )}

                {/* --- RINGKASAN HARGA --- */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatRupiah(totalHarga)}</span>
                  </div>
                  {promoTerpakai && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Diskon ({promoTerpakai.kodeVoucher})</span>
                      <span>-{formatRupiah(totalPotongan)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xl font-bold text-gray-800 pt-3 border-t border-gray-200">
                  <span>Total Bayar:</span>
                  <span className="text-orange-600">
                    {formatRupiah(totalAkhirBayar)}
                  </span>
                </div>

                <button
                  onClick={checkoutWhatsApp}
                  className="w-full mt-4 bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
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
                  Pesan via WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================== */}
      {/* TOMBOL FLOATING PEMICU BOTTOM SHEET (HANYA MUNCUL DI MOBILE) */}
      {/* ========================================================== */}
      {isClient && keranjang.length > 0 && (
        <div
          onClick={() => setIsCartSheetOpen(true)}
          className={`fixed bottom-4 left-4 right-4 bg-orange-600 text-white rounded-xl shadow-[0_10px_30px_-5px_rgba(234,88,12,0.6)] p-4 flex justify-between items-center z-30 md:hidden cursor-pointer transition-all duration-500 ease-in-out ${
            isCartSheetOpen
              ? "translate-y-24 opacity-0 pointer-events-none"
              : "translate-y-0 opacity-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="bg-white text-orange-600 font-bold w-8 h-8 text-sm flex items-center justify-center rounded-full shadow-inner">
              {totalItem}
            </span>
            <span className="font-semibold text-sm">Lihat Keranjang</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              {formatRupiah(totalAkhirBayar)}
            </span>
            <svg
              className="w-5 h-5 text-orange-200 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 15l7-7 7 7"
              ></path>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
