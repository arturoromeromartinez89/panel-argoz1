// app/components/StatCard.jsx
export default function StatCard({ title, value }) {
  return (
    <div
      className="rounded-xl bg-[#0B1220] text-white shadow-md px-6 py-5 w-full"
      style={{ minHeight: 120 }}
    >
      <div className="text-sm/5 opacity-80">{title}</div>
      <div className="mt-3 text-4xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
