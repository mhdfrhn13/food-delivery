// src/components/MenuCard.js
import { formatRupiah } from "../utils/format";

export default function MenuCard({
  menu,
  onTambahKeranjang,
  onKurangKeranjang,
  jumlahPesanan = 0,
}) {
  // Jika properti 'tersedia' belum ada dari Sanity, kita anggap default-nya true
  const isTersedia = menu.tersedia !== false;

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden transition flex flex-col ${
        isTersedia ? "hover:shadow-lg" : "opacity-75"
      }`}
    >
      <div className="relative">
        <img
          src={menu.gambar}
          alt={menu.nama}
          className={`w-full h-48 object-cover ${!isTersedia ? "grayscale" : ""}`}
        />
        {/* Badge Habis */}
        {!isTersedia && (
          <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            HABIS
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-xl font-semibold text-gray-800">{menu.nama}</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4 h-10 line-clamp-2">
          {menu.deskripsi}
        </p>

        <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-4">
          <span
            className={`text-lg font-bold ${isTersedia ? "text-orange-600" : "text-gray-400"}`}
          >
            {formatRupiah(menu.harga)}
          </span>

          {/* LOGIKA PERUBAHAN TOMBOL */}
          {!isTersedia ? (
            <button
              disabled
              className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-500 cursor-not-allowed"
            >
              Habis
            </button>
          ) : jumlahPesanan > 0 ? (
            // Tampilan jika menu SUDAH ada di keranjang
            <div className="flex items-center gap-3 bg-orange-50 px-1.5 py-1.5 rounded-lg border border-orange-200 animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => onKurangKeranjang(menu.id)}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-orange-600 font-bold shadow-sm hover:bg-orange-100 transition active:scale-95"
              >
                -
              </button>
              <span className="font-bold text-gray-800 w-4 text-center">
                {jumlahPesanan}
              </span>
              <button
                onClick={() => onTambahKeranjang(menu)}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-orange-600 text-white font-bold shadow-sm hover:bg-orange-700 transition active:scale-95"
              >
                +
              </button>
            </div>
          ) : (
            // Tampilan jika menu BELUM ada di keranjang
            <button
              onClick={() => onTambahKeranjang(menu)}
              className="px-4 py-2 rounded-lg font-semibold bg-orange-500 text-white hover:bg-orange-600 active:scale-95 transition shadow-sm"
            >
              + Pesan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
