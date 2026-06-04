// src/components/MenuCard.js
import { formatRupiah } from "../utils/format";

export default function MenuCard({ menu, onTambahKeranjang }) {
  // Jika properti 'tersedia' belum ada dari Sanity, kita anggap default-nya true (tersedia)
  const isTersedia = menu.tersedia !== false;

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden transition ${
        isTersedia ? "hover:shadow-lg" : "opacity-75"
      }`}
    >
      <div className="relative">
        <img
          src={menu.gambar}
          alt={menu.nama}
          className={`w-full h-48 object-cover ${!isTersedia ? "grayscale" : ""}`}
        />
        {/* Badge / Label Habis di atas gambar */}
        {!isTersedia && (
          <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            HABIS
          </div>
        )}
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800">{menu.nama}</h2>
        <p className="text-sm text-gray-500 mt-1 h-10 line-clamp-2">
          {menu.deskripsi}
        </p>

        <div className="flex justify-between items-center mt-4">
          <span
            className={`text-lg font-bold ${isTersedia ? "text-orange-600" : "text-gray-400"}`}
          >
            {formatRupiah(menu.harga)}
          </span>

          <button
            onClick={() => onTambahKeranjang(menu)}
            disabled={!isTersedia}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              isTersedia
                ? "bg-orange-500 text-white hover:bg-orange-600 active:scale-95"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isTersedia ? "+ Pesan" : "Habis"}
          </button>
        </div>
      </div>
    </div>
  );
}
