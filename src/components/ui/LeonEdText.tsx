import React from "react";

export function LeonEdLogoText() {
  return (
    <span className="font-bold">
      <span style={{ color: '#053d26' }}>Leon</span>
      <span style={{ color: '#b45309' }}>Ed</span>
    </span>
  );
}

export function FormattedText({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split("LeonEd");
  return (
    <>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && <LeonEdLogoText />}
        </React.Fragment>
      ))}
    </>
  );
}
