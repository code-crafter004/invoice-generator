export type ServiceItem = {
  description: string;
  qty: number;
  rate: number;
};

export type InvoiceFormData = {
  client_name: string;
  client_email: string;
  client_address: string;
  your_name: string;
  your_email: string;
  invoice_number: string;
  date: string;
  due_date: string;
  services: ServiceItem[];
  notes: string;
};
