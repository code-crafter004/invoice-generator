import type { InvoiceFormData } from "./types";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function createDefaultForm(): InvoiceFormData {
  const today = new Date();
  const due = new Date();
  due.setDate(due.getDate() + 14);

  return {
    client_name: "",
    client_email: "",
    client_address: "",
    your_name: "",
    your_email: "",
    invoice_number: `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-001`,
    date: formatDate(today),
    due_date: formatDate(due),
    services: [{ description: "", qty: 1, rate: 0 }],
    notes: "Payment due within 14 days. Thank you!",
  };
}

export function calculateLineTotal(qty: number, rate: number): number {
  return Math.round(qty * rate * 100) / 100;
}

export function calculateGrandTotal(
  services: { qty: number; rate: number }[],
): number {
  return services.reduce(
    (sum, item) => sum + calculateLineTotal(item.qty, item.rate),
    0,
  );
}
