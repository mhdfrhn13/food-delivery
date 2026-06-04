// src/app/page.js
"use client";

import { useState, useEffect } from "react";
import { menuMakanan } from "../data/menu";
import MenuCard from "../components/MenuCard";
import CartItem from "../components/CartItem";
import CheckoutForm from "../components/CheckoutForm";
import Toast from "../components/Toast";
import { formatRupiah } from "../utils/format";

export default function Home() {
  const [keranjang, setKeranjang] = useState([]);
  const [kategoriTerpilih, setKategoriTerpilih] = useState("Semua");
  const [form, setForm] = useState({
    namaPemesan: "",
    alamat: "",
    catatan: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState({ pesan: "", tampil: false });
  const [isClient, setIsClient] = useState(false);

  const daftarKategori = ["Semua", "Makanan", "Minuman", "Cemilan"];

  // Ambil data dari LocalStorage
  useEffect(() => {
    setIsClient(true);
    const keranjangTersimpan = localStorage.getItem("rm_keranjang_belanja");
    if (keranjangTersimpan) {
      try {
        setKeranjang(JSON.parse(keranjangTersimpan));
      } catch (error) {
        console.error("Gagal memuat data keranjang", error);
      }
    }
  }, []);

  // Simpan data ke LocalStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("rm_keranjang_belanja", JSON.stringify(keranjang));
    }
  }, [keranjang, isClient]);

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
  };

  const sampleHapusSemuaItem = () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan keranjang?")) {
      setKeranjang([]);
      tampilkanToast("Keranjang dikosongkan.");
    }
  };

  // Kalkulasi Total Harga dan Total Item
  const totalHarga = keranjang.reduce(
    (total, item) => total + item.harga * item.jumlah,
    0,
  );
  const totalItem = keranjang.reduce((total, item) => total + item.jumlah, 0);

  const checkoutWhatsApp = () => {
    let errors = {};
    if (keranjang.length === 0) return alert("Keranjang masih kosong!");
    if (!form.namaPemesan.trim())
      errors.namaPemesan = "Nama pemesan wajib diisi!";
    if (!form.alamat.trim()) errors.alamat = "Alamat pengiriman wajib diisi!";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const nomorWA = "6281234567890";
    let pesan = `*PESANAN BARU - RUMAH MAKAN*\n\n*Detail Pengiriman:*\n• Nama Pemesan: ${form.namaPemesan}\n• Alamat Lengkap: ${form.alamat}\n`;
    if (form.catatan.trim()) pesan += `• Catatan: ${form.catatan}\n`;

    pesan += `\n*Daftar Pesanan:*\n`;
    keranjang.forEach((item) => {
      pesan += `- ${item.nama} (${item.jumlah}x) : ${formatRupiah(item.harga * item.jumlah)}\n`;
    });

    pesan += `\n*Total Pembayaran: ${formatRupiah(totalHarga)}*\n\nTerima kasih!`;
    window.open(
      `https://wa.me/${nomorWA}?text=${encodeURIComponent(pesan)}`,
      "_blank",
    );
  };

  const menuTersaring = menuMakanan.filter((menu) => {
    if (kategoriTerpilih === "Semua") return true;
    return menu.kategori === kategoriTerpilih;
  });

  // Fungsi untuk scroll mulus ke area keranjang saat di HP
  const gulirKeKeranjang = () => {
    const areaKeranjang = document.getElementById("area-keranjang");
    if (areaKeranjang) {
      areaKeranjang.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    // Tambahan pb-24 (padding bottom) khusus agar menu terbawah tidak tertutup oleh bar melayang di HP
    <div className="min-h-screen bg-gray-50 p-6 pb-24 md:pb-6 font-sans relative">
      <Toast pesan={toast.pesan} tampil={toast.tampil} />

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* KIRI: DAFTAR MENU & FILTER */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Menu Rumah Makan
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Silakan pilih kategori hidangan favorit Anda
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {daftarKategori.map((kategori) => (
              <button
                key={kategori}
                onClick={() => setKategoriTerpilih(kategori)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition shadow-sm ${
                  kategoriTerpilih === kategori
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {kategori}
              </button>
            ))}
          </div>

          {menuTersaring.length === 0 ? (
            <p className="text-gray-500 text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              Menu untuk kategori "{kategoriTerpilih}" belum tersedia.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {menuTersaring.map((menu) => (
                <MenuCard
                  key={menu.id}
                  menu={menu}
                  onTambahKeranjang={tambahKeKeranjang}
                />
              ))}
            </div>
          )}
        </div>

        {/* KANAN: KERANJANG BELANJA & FORM */}
        {/* ID 'area-keranjang' ditambahkan sebagai target scroll */}
        <div
          id="area-keranjang"
          className="bg-white p-6 rounded-xl shadow-md h-fit sticky top-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Keranjang Anda</h2>
            {keranjang.length > 0 && (
              <button
                onClick={sampleHapusSemuaItem}
                className="text-xs text-red-500 hover:text-red-700 font-semibold underline transition"
              >
                Kosongkan
              </button>
            )}
          </div>

          {!isClient ? (
            <p className="text-gray-400 text-center py-4 text-sm animate-pulse">
              Memuat keranjang...
            </p>
          ) : keranjang.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada pesanan.</p>
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

              <CheckoutForm form={form} setForm={setForm} errors={formErrors} />

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                  <span>Total:</span>
                  <span className="text-orange-600">
                    {formatRupiah(totalHarga)}
                  </span>
                </div>
                <button
                  onClick={checkoutWhatsApp}
                  className="w-full mt-4 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition flex justify-center items-center gap-2 shadow-md active:scale-95"
                >
                  Pesan via WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* FLOATING BOTTOM BAR (KHUSUS MOBILE) */}
      {/* ========================================== */}
      {isClient && keranjang.length > 0 && (
        <div
          onClick={gulirKeKeranjang}
          className="fixed bottom-4 left-4 right-4 bg-orange-600 text-white rounded-xl shadow-[0_10px_25px_-5px_rgba(234,88,12,0.5)] p-4 flex justify-between items-center z-40 md:hidden cursor-pointer active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-3">
            {/* Lingkaran Indikator Jumlah Item */}
            <span className="bg-white text-orange-600 font-bold w-7 h-7 text-sm flex items-center justify-center rounded-full">
              {totalItem}
            </span>
            <span className="font-semibold text-sm">Item Pesanan</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              {formatRupiah(totalHarga)}
            </span>
            {/* Ikon Panah Kanan/Bawah untuk menandakan interaksi */}
            <svg
              className="w-5 h-5 text-orange-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
