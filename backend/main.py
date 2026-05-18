import io

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from invoice_generator import generate_pdf
from pydantic import BaseModel, Field


app = FastAPI(title="Invoice Generator API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ServiceItem(BaseModel):
    description: str
    qty: float = Field(gt=0)
    rate: float = Field(ge=0)


class InvoiceData(BaseModel):
    client_name: str
    client_email: str
    client_address: str
    your_name: str
    your_email: str
    invoice_number: str
    date: str
    due_date: str
    services: list[ServiceItem]
    notes: str = ""


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/generate")
def generate_invoice(data: InvoiceData):
    pdf_bytes = generate_pdf(data.model_dump())
    filename = f"invoice-{data.invoice_number}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
