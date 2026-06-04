// src/components/MenuCard.js
import { formatRupiah } from "../utils/format";

export default function MenuCard({ menu, onTambahKeranjang }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      <img
        src={menu.gambar}
        alt={menu.nama}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800">{menu.nama}</h2>
        <p className="text-sm text-gray-500 mt-1 h-10 line-clamp-2">
          {menu.deskripsi}
        </p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-lg font-bold text-orange-600">
            {formatRupiah(menu.harga)}
          </span>
          <button
            onClick={() => onTambahKeranjang(menu)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition active:scale-95"
          >
            + Pesan
          </button>
        </div>
      </div>
    </div>
  );
}
