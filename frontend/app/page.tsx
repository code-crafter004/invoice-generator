import InvoiceForm from "@/components/InvoiceForm";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-100/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <header className="mb-10 text-center">
          <p className="mb-3 inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
            Portfolio project
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Automated Invoice Generator
            <span className="block text-brand-600">for Freelancers</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
            Enter client details and services — get a polished PDF invoice in
            one click. Built with Next.js, Python, FastAPI, and ReportLab.
          </p>
        </header>

        <InvoiceForm />

        <footer className="mt-12 text-center text-sm text-slate-500">
          Python PDF generation · File automation · Deployed on Vercel
        </footer>
      </div>
    </main>
  );
}
