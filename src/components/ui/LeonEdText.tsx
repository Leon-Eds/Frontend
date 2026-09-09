import React from "react";

export function LeonEdLogoText() {
  return (
    <img 
      src="/logo.png" 
      alt="LeonEd Logo" 
      className="inline-block h-6 w-auto align-middle mx-1 -mt-1" 
    />
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
