// src/components/CheckoutForm.js
export default function CheckoutForm({ form, setForm, errors }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="pt-4 border-t border-gray-200 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Detail Pengiriman</h3>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Nama Pemesan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="namaPemesan"
          value={form.namaPemesan}
          onChange={handleChange}
          placeholder="Masukkan nama lengkap Anda"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm text-gray-800 transition ${
            errors.namaPemesan
              ? "border-red-500 focus:ring-red-500 bg-red-50"
              : "border-gray-300 focus:ring-orange-500"
          }`}
        />
        {errors.namaPemesan && (
          <p className="text-xs text-red-500 mt-1">{errors.namaPemesan}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Alamat Pengiriman <span className="text-red-500">*</span>
        </label>
        <textarea
          name="alamat"
          value={form.alamat}
          onChange={handleChange}
          placeholder="Masukkan alamat lengkap pengiriman"
          rows="2"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm text-gray-800 resize-none transition ${
            errors.alamat
              ? "border-red-500 focus:ring-red-500 bg-red-50"
              : "border-gray-300 focus:ring-orange-500"
          }`}
        />
        {errors.alamat && (
          <p className="text-xs text-red-500 mt-1">{errors.alamat}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Catatan Pesanan (Opsional)
        </label>
        <input
          type="text"
          name="catatan"
          value={form.catatan}
          onChange={handleChange}
          placeholder="Contoh: Sambal dipisah, kuah banyakin"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-800"
        />
      </div>
    </div>
  );
}
