// src/components/Toast.js
export default function Toast({ pesan, tampil }) {
  return (
    <div
      className={`fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-300 z-50 ${
        tampil
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      {/* Ikon Centang (Check) */}
      <svg
        className="w-5 h-5 text-green-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        ></path>
      </svg>
      <span className="font-medium text-sm">{pesan}</span>
    </div>
  );
}
