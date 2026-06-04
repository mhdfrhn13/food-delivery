"use client"; // Wajib ditambahkan karena kita menggunakan interaksi state (useState)

import { useState } from "react";
import { menuMakanan } from "../data/menu";

export default function Home() {
  const [keranjang, setKeranjang] = useState([]);

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

  // Fungsi untuk menghitung total harga
  const totalHarga = keranjang.reduce(
    (total, item) => total + item.harga * item.jumlah,
    0,
  );

  // Fungsi checkout kirim ke WhatsApp
  const checkoutWhatsApp = () => {
    if (keranjang.length === 0) return alert("Keranjang masih kosong!");

    const nomorWA = "6281234567890"; // Ganti dengan nomor WA rumah makan
    let pesan = "Halo, saya ingin memesan:\n\n";

    keranjang.forEach((item) => {
      pesan += `- ${item.nama} (${item.jumlah}x) : Rp ${item.harga * item.jumlah}\n`;
    });

    pesan += `\n*Total: Rp ${totalHarga}*`;
    pesan += "\n\nMohon info untuk pembayaran dan pengiriman. Terima kasih!";

    const urlWA = `https://wa.me/${nomorWA}?text=${encodeURIComponent(pesan)}`;
    window.open(urlWA, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* BAGIAN KIRI: DAFTAR MENU */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Menu Rumah Makan
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {menuMakanan.map((menu) => (
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
        </div>

        {/* BAGIAN KANAN: KERANJANG BELANJA */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit sticky top-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Keranjang Anda
          </h2>

          {keranjang.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada pesanan.</p>
          ) : (
            <div className="space-y-4">
              {keranjang.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{item.nama}</p>
                    <p className="text-sm text-gray-500">
                      Rp {item.harga} x {item.jumlah}
                    </p>
                  </div>
                  <p className="font-bold text-gray-800">
                    Rp {(item.harga * item.jumlah).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}

              <div className="pt-4 flex justify-between items-center text-xl font-bold text-gray-800">
                <span>Total:</span>
                <span className="text-orange-600">
                  Rp {totalHarga.toLocaleString("id-ID")}
                </span>
              </div>

              <button
                onClick={checkoutWhatsApp}
                className="w-full mt-4 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition flex justify-center items-center gap-2"
              >
                Pesan via WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
