import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type ServiceItem = {
  description: string;
  qty: number;
  rate: number;
};

type InvoicePayload = {
  client_name: string;
  client_email: string;
  client_address: string;
  your_name: string;
  your_email: string;
  invoice_number: string;
  date: string;
  due_date: string;
  services: ServiceItem[];
  notes?: string;
};

function money(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as InvoicePayload;
    const services = data.services.map((item) => ({
      ...item,
      total: Math.round(item.qty * item.rate * 100) / 100,
    }));
    const grandTotal = services.reduce((sum, item) => sum + item.total, 0);

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([612, 792]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const dark = rgb(0.06, 0.09, 0.15);
    const muted = rgb(0.39, 0.45, 0.55);
    let y = 740;

    page.drawText("INVOICE", { x: 50, y, size: 26, font: fontBold, color: dark });
    page.drawText(`#${data.invoice_number}`, {
      x: 400,
      y,
      size: 11,
      font: fontBold,
      color: dark,
    });
    y -= 16;
    page.drawText(`Date: ${data.date}`, { x: 400, y, size: 10, font, color: muted });
    y -= 14;
    page.drawText(`Due: ${data.due_date}`, { x: 400, y, size: 10, font, color: muted });

    y -= 40;
    page.drawText("From", { x: 50, y, size: 9, font: fontBold, color: muted });
    page.drawText("Bill To", { x: 310, y, size: 9, font: fontBold, color: muted });
    y -= 16;
    page.drawText(data.your_name, { x: 50, y, size: 10, font, color: dark });
    page.drawText(data.client_name, { x: 310, y, size: 10, font, color: dark });
    y -= 14;
    page.drawText(data.your_email, { x: 50, y, size: 10, font, color: dark });
    page.drawText(data.client_email, { x: 310, y, size: 10, font, color: dark });
    y -= 14;
    const addressLines = data.client_address.split("\n");
    for (const line of addressLines) {
      page.drawText(line, { x: 310, y, size: 10, font, color: dark });
      y -= 14;
    }

    y -= 20;
    page.drawRectangle({
      x: 50,
      y: y - 8,
      width: 512,
      height: 22,
      color: dark,
    });
    page.drawText("Description", { x: 56, y, size: 10, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Qty", { x: 340, y, size: 10, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Rate", { x: 400, y, size: 10, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText("Amount", { x: 470, y, size: 10, font: fontBold, color: rgb(1, 1, 1) });

    y -= 28;
    for (const item of services) {
      page.drawText(item.description.slice(0, 40), { x: 56, y, size: 10, font, color: dark });
      page.drawText(String(item.qty), { x: 340, y, size: 10, font, color: dark });
      page.drawText(money(item.rate), { x: 400, y, size: 10, font, color: dark });
      page.drawText(money(item.total), { x: 470, y, size: 10, font, color: dark });
      y -= 22;
    }

    y -= 8;
    page.drawText("Total", { x: 400, y, size: 11, font: fontBold, color: dark });
    page.drawText(money(grandTotal), { x: 470, y, size: 11, font: fontBold, color: dark });

    if (data.notes) {
      y -= 30;
      page.drawText("Notes", { x: 50, y, size: 9, font: fontBold, color: muted });
      y -= 14;
      page.drawText(data.notes.slice(0, 200), { x: 50, y, size: 10, font, color: dark });
    }

    y -= 40;
    page.drawText("Thank you for your business.", { x: 50, y, size: 10, font, color: muted });

    const pdfBytes = await pdf.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${data.invoice_number}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
