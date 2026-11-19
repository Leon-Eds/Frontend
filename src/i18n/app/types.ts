/** One page's strings in every supported language. Missing keys fall back to English at runtime. */
export type PageDict = Record<"en" | "ig" | "yo" | "ha" | "fr" | "es" | "de" | "pt" | "zh", Record<string, string>>;
