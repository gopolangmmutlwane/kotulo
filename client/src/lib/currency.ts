export function formatPrice(price: string | number, currency: string = "ZAR"): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(numPrice).replace("ZAR", "R");
}

export function formatPriceWithUnit(price: string | number, unit: string): string {
  return `${formatPrice(price)}/${unit}`;
}
