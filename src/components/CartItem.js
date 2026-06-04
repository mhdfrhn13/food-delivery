// src/components/CartItem.js
import { formatRupiah } from "../utils/format";

export default function CartItem({ item, onTambah, onKurang, onHapus }) {
  return (
    <div className="flex justify-between items-center border-b pb-4 mb-2">
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{item.nama}</p>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-gray-500">{formatRupiah(item.harga)}</p>
          <div className="flex items-center bg-gray-100 rounded-lg">
            <button
              onClick={() => onKurang(item.id)}
              className="px-2 py-1 text-gray-600 hover:text-red-500 font-bold transition"
            >
              -
            </button>
            <span className="px-2 text-sm font-semibold w-6 text-center">
              {item.jumlah}
            </span>
            <button
              onClick={() => onTambah(item)}
              className="px-2 py-1 text-gray-600 hover:text-green-500 font-bold transition"
            >
              +
            </button>
          </div>
        </div>
      </div>
      <div className="text-right ml-4">
        <p className="font-bold text-gray-800">
          {formatRupiah(item.harga * item.jumlah)}
        </p>
        <button
          onClick={() => onHapus(item.id)}
          className="text-xs text-red-500 hover:underline mt-1"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}
