// src/components/CheckoutForm.js

export default function CheckoutForm({ form, setForm, errors, qrisUrl }) {
  // <-- Tambahkan qrisUrl di sini
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <div className="space-y-4">
      {/* Input Nama Pemesan */}
      <div>
        <label
          htmlFor="namaPemesan"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nama Pemesan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="namaPemesan"
          name="namaPemesan"
          value={form.namaPemesan}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition ${
            errors.namaPemesan ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Masukkan nama Anda"
        />
        {errors.namaPemesan && (
          <p className="text-red-500 text-xs mt-1">{errors.namaPemesan}</p>
        )}
      </div>

      {/* Input Alamat */}
      <div>
        <label
          htmlFor="alamat"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Alamat Pengiriman <span className="text-red-500">*</span>
        </label>
        <textarea
          id="alamat"
          name="alamat"
          rows="2"
          value={form.alamat}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition resize-none ${
            errors.alamat ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Alamat lengkap beserta patokan"
        ></textarea>
        {errors.alamat && (
          <p className="text-red-500 text-xs mt-1">{errors.alamat}</p>
        )}
      </div>

      {/* Pilihan Metode Pembayaran */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Metode Pembayaran <span className="text-red-500">*</span>
        </label>

        <div className="flex flex-col sm:flex-row gap-4 mb-3">
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-orange-50 transition flex-1">
            <input
              type="radio"
              name="metodePembayaran"
              value="Cash"
              checked={form.metodePembayaran === "Cash"}
              onChange={handleChange}
              className="w-4 h-4 text-orange-600 focus:ring-orange-500"
            />
            <span className="font-medium text-gray-700">Cash (COD)</span>
          </label>

          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-orange-50 transition flex-1">
            <input
              type="radio"
              name="metodePembayaran"
              value="QRIS"
              checked={form.metodePembayaran === "QRIS"}
              onChange={handleChange}
              className="w-4 h-4 text-orange-600 focus:ring-orange-500"
            />
            <span className="font-medium text-gray-700">QRIS (Digital)</span>
          </label>
        </div>

        {/* --- AREA GAMBAR QRIS DINAMIS DARI SANITY --- */}
        {form.metodePembayaran === "QRIS" && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex flex-col items-center text-center animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm font-semibold text-gray-800 mb-3">
              Scan QRIS di Bawah Ini
            </p>

            <img
              // Gunakan qrisUrl dari Sanity. Jika admin belum upload, tampilkan placeholder
              src={
                qrisUrl ||
                "https://via.placeholder.com/200?text=QRIS+Belum+Tersedia"
              }
              alt="Kode QRIS Pembayaran"
              className="w-48 h-48 object-contain bg-white p-2 rounded-lg border border-gray-200 shadow-sm mb-4"
            />

            <div className="bg-white px-4 py-3 rounded-md shadow-sm border border-gray-200 w-full flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5 text-red-500 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              <p className="text-sm font-bold text-red-600">
                Lampirkan bukti pembayaran ke WA
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input Catatan */}
      <div>
        <label
          htmlFor="catatan"
          className="block text-sm font-medium text-gray-700 mb-1 mt-2"
        >
          Catatan Tambahan
        </label>
        <input
          type="text"
          id="catatan"
          name="catatan"
          value={form.catatan}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
          placeholder="Misal: Jangan pakai seledri, pedas, dll"
        />
      </div>
    </div>
  );
}
