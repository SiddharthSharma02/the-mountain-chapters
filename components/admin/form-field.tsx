export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-navy">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-navy/20 px-3 py-2.5 text-sm focus:border-gold focus:outline-none";
