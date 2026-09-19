// Cantidad en pesos mexicanos con los separadores del idioma activo:
// 3,493.01 MXN (es/en/ko) · 3 493,01 MXN (fr) · 3.493,01 MXN (it).
export const formatMXN = (value, locale) =>
    `${value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
