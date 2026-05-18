"use client";

import { useMemo, useState } from "react";
import {
  calculateGrandTotal,
  calculateLineTotal,
  createDefaultForm,
} from "@/lib/defaults";
import { getGenerateUrl } from "@/lib/api";
import type { InvoiceFormData, ServiceItem } from "@/lib/types";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export default function InvoiceForm() {
  const [form, setForm] = useState<InvoiceFormData>(createDefaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grandTotal = useMemo(
    () => calculateGrandTotal(form.services),
    [form.services],
  );

  function updateField<K extends keyof InvoiceFormData>(
    key: K,
    value: InvoiceFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateService(index: number, patch: Partial<ServiceItem>) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  function addService() {
    setForm((prev) => ({
      ...prev,
      services: [...prev.services, { description: "", qty: 1, rate: 0 }],
    }));
  }

  function removeService(index: number) {
    setForm((prev) => ({
      ...prev,
      services:
        prev.services.length > 1
          ? prev.services.filter((_, i) => i !== index)
          : prev.services,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(getGenerateUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const message = await response.text();
        let errorMessage = message || "Failed to generate invoice PDF.";
        try {
          const parsed = JSON.parse(message) as { error?: string };
          if (parsed.error) errorMessage = parsed.error;
        } catch {
          /* use raw message */
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${form.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Is the Python API running on port 8000?",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="glass rounded-2xl p-6 md:p-8">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          Your business
        </h2>
        <p className="mb-6 text-sm text-slate-500">Shown in the From section</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name">
            <input
              required
              className={inputClass}
              value={form.your_name}
              onChange={(e) => updateField("your_name", e.target.value)}
              placeholder="Alex Rivera"
            />
          </Field>
          <Field label="Your email">
            <input
              required
              type="email"
              className={inputClass}
              value={form.your_email}
              onChange={(e) => updateField("your_email", e.target.value)}
              placeholder="alex@studio.com"
            />
          </Field>
        </div>
      </section>

      <section className="glass rounded-2xl p-6 md:p-8">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          Client details
        </h2>
        <p className="mb-6 text-sm text-slate-500">Bill To on the invoice</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Client name">
            <input
              required
              className={inputClass}
              value={form.client_name}
              onChange={(e) => updateField("client_name", e.target.value)}
              placeholder="Acme Corp"
            />
          </Field>
          <Field label="Client email">
            <input
              required
              type="email"
              className={inputClass}
              value={form.client_email}
              onChange={(e) => updateField("client_email", e.target.value)}
              placeholder="billing@acme.com"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Client address">
              <textarea
                required
                rows={3}
                className={inputClass}
                value={form.client_address}
                onChange={(e) => updateField("client_address", e.target.value)}
                placeholder={"123 Market St\nSan Francisco, CA 94103"}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="glass rounded-2xl p-6 md:p-8">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          Invoice meta
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Invoice number">
            <input
              required
              className={inputClass}
              value={form.invoice_number}
              onChange={(e) => updateField("invoice_number", e.target.value)}
            />
          </Field>
          <Field label="Issue date">
            <input
              required
              type="date"
              className={inputClass}
              value={form.date}
              onChange={(e) => updateField("date", e.target.value)}
            />
          </Field>
          <Field label="Due date">
            <input
              required
              type="date"
              className={inputClass}
              value={form.due_date}
              onChange={(e) => updateField("due_date", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="glass rounded-2xl p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Services</h2>
            <p className="text-sm text-slate-500">Line items on the PDF</p>
          </div>
          <button
            type="button"
            onClick={addService}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
          >
            + Add line item
          </button>
        </div>

        <div className="space-y-4">
          {form.services.map((service, index) => {
            const lineTotal = calculateLineTotal(service.qty, service.rate);
            return (
              <div
                key={index}
                className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 md:grid-cols-12 md:items-end"
              >
                <div className="md:col-span-5">
                  <Field label="Description">
                    <input
                      required
                      className={inputClass}
                      value={service.description}
                      onChange={(e) =>
                        updateService(index, { description: e.target.value })
                      }
                      placeholder="Logo design package"
                    />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Qty">
                    <input
                      required
                      type="number"
                      min={0.01}
                      step={0.01}
                      className={inputClass}
                      value={service.qty}
                      onChange={(e) =>
                        updateService(index, {
                          qty: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Rate ($)">
                    <input
                      required
                      type="number"
                      min={0}
                      step={0.01}
                      className={inputClass}
                      value={service.rate}
                      onChange={(e) =>
                        updateService(index, {
                          rate: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </Field>
                </div>
                <div className="flex items-end justify-between gap-3 md:col-span-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Line total
                    </p>
                    <p className="font-mono text-lg font-semibold text-slate-900">
                      ${lineTotal.toFixed(2)}
                    </p>
                  </div>
                  {form.services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="rounded-lg px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                      aria-label="Remove line item"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Grand total
            </p>
            <p className="font-mono text-3xl font-bold text-brand-700">
              ${grandTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </section>

      <section className="glass rounded-2xl p-6 md:p-8">
        <Field label="Notes (optional)">
          <textarea
            rows={3}
            className={inputClass}
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Payment instructions, bank details, etc."
          />
        </Field>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:from-brand-700 hover:to-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[280px]"
      >
        {loading ? "Generating PDF…" : "Download PDF invoice"}
      </button>
    </form>
  );
}