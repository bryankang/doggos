export const config = (): typeof process.env => {
  return typeof window === "undefined" ? process.env : (window as any).ENV;
};
