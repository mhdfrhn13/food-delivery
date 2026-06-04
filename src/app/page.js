"use client"; // Wajib ditambahkan karena kita menggunakan interaksi state (useState)

import { useState } from "react";
import { menuMakanan } from "../data/menu";

export default function Home() {
  const [keranjang, setKeranjang] = useState([]);

  // State untuk Formulir Detail Pengiriman
  const [namaPemesan, setNamaPemesan] = useState("");
  const [alamat, setAlamat] = useState("");
  const [catatan, setCatatan] = useState("");

  // State untuk Filter Kategori Menu
  const [kategoriTerpilih, setKategoriTerpilih] = useState("Semua");

  // Daftar kategori yang tersedia di aplikasi
  const daftarKategori = ["Semua", "Makanan", "Minuman", "Cemilan"];

  // Fungsi untuk menambah makanan ke keranjang
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
  };

  // Fungsi untuk mengurangi jumlah makanan di keranjang
  const kurangiDariKeranjang = (id) => {
    const itemAda = keranjang.find((item) => item.id === id);

    if (itemAda.jumlah === 1) {
      // Jika jumlahnya 1, maka hapus item dari keranjang
      setKeranjang(keranjang.filter((item) => item.id !== id));
    } else {
      // Jika lebih dari 1, kurangi jumlahnya
      setKeranjang(
        keranjang.map((item) =>
          item.id === id ? { ...item, jumlah: item.jumlah - 1 } : item,
        ),
      );
    }
  };

  // Fungsi untuk menghapus item sepenuhnya dari keranjang
  const hapusDariKeranjang = (id) => {
    setKeranjang(keranjang.filter((item) => item.id !== id));
  };

  // Fungsi untuk menghitung total harga
  const totalHarga = keranjang.reduce(
    (total, item) => total + item.harga * item.jumlah,
    0,
  );

  // Fungsi checkout kirim ke WhatsApp
  const checkoutWhatsApp = () => {
    if (keranjang.length === 0) return alert("Keranjang masih kosong!");
    if (!namaPemesan.trim())
      return alert("Mohon isi Nama Pemesan terlebih dahulu!");
    if (!alamat.trim())
      return alert("Mohon isi Alamat Pengiriman terlebih dahulu!");

    const nomorWA = "6281234567890"; // Ganti dengan nomor WA rumah makan

    let pesan = "*PESANAN BARU - RUMAH MAKAN*\n\n";
    pesan += `*Detail Pengiriman:*\n`;
    pesan += `• Nama Pemesan: ${namaPemesan}\n`;
    pesan += `• Alamat Lengkap: ${alamat}\n`;
    if (catatan.trim()) {
      pesan += `• Catatan: ${catatan}\n`;
    }
    pesan += `\n*Daftar Pesanan:*\n`;

    keranjang.forEach((item) => {
      pesan += `- ${item.nama} (${item.jumlah}x) : Rp ${(item.harga * item.jumlah).toLocaleString("id-ID")}\n`;
    });

    pesan += `\n*Total Pembayaran: Rp ${totalHarga.toLocaleString("id-ID")}*\n\n`;
    pesan +=
      "Mohon info untuk instruksi pembayaran dan estimasi pengiriman. Terima kasih!";

    const urlWA = `https://wa.me/${nomorWA}?text=${encodeURIComponent(pesan)}`;
    window.open(urlWA, "_blank");
  };

  // Memfilter menu makanan berdasarkan kategori terpilih
  const menuTersaring = menuMakanan.filter((menu) => {
    if (kategoriTerpilih === "Semua") return true;

    // Fallback deteksi otomatis jika properti 'kategori' belum didefinisikan di data/menu.js
    const kategoriMenu =
      menu.kategori || (menu.id === 3 ? "Minuman" : "Makanan");
    return kategoriMenu === kategoriTerpilih;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* BAGIAN KIRI: DAFTAR MENU & FILTER */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Menu Rumah Makan
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Silakan pilih kategori hidangan favorit Anda
          </p>

          {/* Tombol Filter Kategori */}
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

          {/* Grid Daftar Menu */}
          {menuTersaring.length === 0 ? (
            <p className="text-gray-500 text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              Menu untuk kategori "{kategoriTerpilih}" belum tersedia saat ini.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {menuTersaring.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <img
                    src={menu.gambar}
                    alt={menu.nama}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {menu.nama}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 h-10">
                      {menu.deskripsi}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-bold text-orange-600">
                        Rp {menu.harga.toLocaleString("id-ID")}
                      </span>
                      <button
                        onClick={() => tambahKeKeranjang(menu)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                      >
                        + Pesan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BAGIAN KANAN: KERANJANG BELANJA & FORMULIR */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit sticky top-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Keranjang Anda
          </h2>

          {keranjang.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada pesanan.</p>
          ) : (
            <div className="space-y-6">
              {/* Daftar Item di Keranjang */}
              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {keranjang.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b pb-4 mb-2"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.nama}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-500">
                          Rp {item.harga.toLocaleString("id-ID")}
                        </p>

                        {/* Kontrol Jumlah */}
                        <div className="flex items-center bg-gray-100 rounded-lg">
                          <button
                            onClick={() => kurangiDariKeranjang(item.id)}
                            className="px-2 py-1 text-gray-600 hover:text-red-500 font-bold transition"
                          >
                            -
                          </button>
                          <span className="px-2 text-sm font-semibold w-6 text-center">
                            {item.jumlah}
                          </span>
                          <button
                            onClick={() => tambahKeKeranjang(item)}
                            className="px-2 py-1 text-gray-600 hover:text-green-500 font-bold transition"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-800">
                        Rp {(item.harga * item.jumlah).toLocaleString("id-ID")}
                      </p>
                      <button
                        onClick={() => hapusDariKeranjang(item.id)}
                        className="text-xs text-red-500 hover:underline mt-1"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Detail Pengiriman */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Detail Pengiriman
                </h3>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Nama Pemesan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={namaPemesan}
                    onChange={(e) => setNamaPemesan(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Alamat Pengiriman <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Masukkan alamat lengkap pengiriman"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-800 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Catatan Pesanan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Sambal dipisah, kuah banyakin"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-800"
                  />
                </div>
              </div>

              {/* Total Harga & Button Checkout */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                  <span>Total:</span>
                  <span className="text-orange-600">
                    Rp {totalHarga.toLocaleString("id-ID")}
                  </span>
                </div>

                <button
                  onClick={checkoutWhatsApp}
                  className="w-full mt-4 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition flex justify-center items-center gap-2 shadow-md"
                >
                  Pesan via WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
