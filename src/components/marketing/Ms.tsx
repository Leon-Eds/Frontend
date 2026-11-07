// Material Symbols Rounded icon (font is loaded by MarketingFrame)
export function Ms({ name, fill, className }: { name: string; fill?: boolean; className?: string }) {
  const cls = ["ms", fill && "fill", className].filter(Boolean).join(" ");
  return (
    <span className={cls} aria-hidden="true">
      {name}
    </span>
  );
}
