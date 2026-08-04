const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const shortDateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});

const monthFormatter = new Intl.DateTimeFormat("es-CO", { month: "short" });

export function formatCurrencyCOP(value: number) {
  return currencyFormatter.format(value ?? 0);
}

export function formatShortDate(value: string | number | Date) {
  return shortDateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | number | Date) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatMonthShort(value: string | number | Date) {
  return monthFormatter.format(new Date(value)).replace(".", "");
}
