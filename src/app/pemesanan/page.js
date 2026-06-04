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

  // 2. STATE UNTUK KERANJANG & KATEGORI
  const [keranjang, setKeranjang] = useState([]);
  const [kategoriTerpilih, setKategoriTerpilih] = useState("Semua");
  const [isClient, setIsClient] = useState(false);

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
  // A. FETCH DATA MENU & PENGATURAN QRIS (SANITY)
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Data Menu Makanan
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

        // Fetch Data Pengaturan (Untuk mendapatkan Gambar QRIS)
        const queryPengaturan = '*[_type == "pengaturan"][0]';
        const dataPengaturan = await client.fetch(queryPengaturan);

        if (dataPengaturan && dataPengaturan.gambarQris) {
          setQrisImageUrl(urlFor(dataPengaturan.gambarQris).url());
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
  // B. PENGELOLAAN LOCAL STORAGE UNTUK KERANJANG
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
    }
  }, [keranjang, isClient]);

  // ==========================================
  // C. FUNGSI INTERAKSI KERANJANG
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
      setPromoTerpakai(null); // Batalkan promo otomatis jika keranjang dikosongkan
      tampilkanToast("Keranjang dikosongkan.");
    }
  };

  // ==========================================
  // D. FUNGSI PROMO & KALKULASI HARGA TOTAL
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

  // Efek membatalkan promo otomatis jika pembeli mengurangi item hingga di bawah syarat belanja minimum
  useEffect(() => {
    if (promoTerpakai && totalHarga < promoTerpakai.minimalPembelian) {
      setPromoTerpakai(null);
      setPromoError(
        `Voucher dibatalkan otomatis karena total belanja kurang dari ${formatRupiah(promoTerpakai.minimalPembelian)}`,
      );
    }
  }, [totalHarga, promoTerpakai]);

  // ==========================================
  // E. FUNGSI CHECKOUT KE WHATSAPP
  // ==========================================
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

    // --> UBAH NOMOR DI BAWAH INI SESUAI NOMOR WA TOKO ANDA <--
    const nomorWA = "6285365968845";

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

  const gulirKeKeranjang = () => {
    const areaKeranjang = document.getElementById("area-keranjang");
    if (areaKeranjang) areaKeranjang.scrollIntoView({ behavior: "smooth" });
  };

  // ==========================================
  // F. RENDERING TAMPILAN (UI)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24 md:pb-6 font-sans relative">
      <Toast pesan={toast.pesan} tampil={toast.tampil} />

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

          <div className="flex flex-wrap gap-2 mb-6">
            {daftarKategori.map((kategori) => (
              <button
                key={kategori}
                onClick={() => setKategoriTerpilih(kategori)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition shadow-sm ${kategoriTerpilih === kategori ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
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

        {/* === AREA KANAN: KERANJANG === */}
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

              {/* FORM CHECKOUT: Mengirimkan link gambar qrisUrl yang ditarik dari Sanity */}
              <CheckoutForm
                form={form}
                setForm={setForm}
                errors={formErrors}
                qrisUrl={qrisImageUrl}
              />

              <div className="pt-4 border-t border-gray-200">
                {/* --- INPUT PROMO / VOUCHER --- */}
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
                  className="w-full mt-4 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition shadow-md active:scale-95"
                >
                  Pesan via WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TOMBOL POPUP MOBILE KETIKA KERANJANG TERISI */}
      {isClient && keranjang.length > 0 && (
        <div
          onClick={gulirKeKeranjang}
          className="fixed bottom-4 left-4 right-4 bg-orange-600 text-white rounded-xl shadow-lg p-4 flex justify-between items-center z-40 md:hidden cursor-pointer active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-3">
            <span className="bg-white text-orange-600 font-bold w-7 h-7 text-sm flex items-center justify-center rounded-full">
              {totalItem}
            </span>
            <span className="font-semibold text-sm">Item Pesanan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              {formatRupiah(totalAkhirBayar)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
