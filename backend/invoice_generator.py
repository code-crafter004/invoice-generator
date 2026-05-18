from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def _money(value: float) -> str:
    return f"${value:,.2f}"


def _text(value: str) -> str:
    return escape(value or "").replace("\n", "<br/>")


def generate_pdf(data: dict) -> bytes:
    for item in data["services"]:
        item["total"] = round(float(item["qty"]) * float(item["rate"]), 2)
    data["grand_total"] = round(sum(i["total"] for i in data["services"]), 2)

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.65 * inch,
        leftMargin=0.65 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.65 * inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "InvoiceTitle",
        parent=styles["Heading1"],
        fontSize=26,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=6,
    )
    label_style = ParagraphStyle(
        "Label",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=2,
    )
    value_style = ParagraphStyle(
        "Value",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=10,
    )
    right_style = ParagraphStyle(
        "Right",
        parent=value_style,
        alignment=TA_RIGHT,
    )

    story = []

    header = Table(
        [
            [
                Paragraph("INVOICE", title_style),
                Paragraph(
                    f"<b>#{_text(data['invoice_number'])}</b><br/>"
                    f"Date: {_text(data['date'])}<br/>"
                    f"Due: {_text(data['due_date'])}",
                    right_style,
                ),
            ]
        ],
        colWidths=[3.5 * inch, 3.2 * inch],
    )
    header.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ]
        )
    )
    story.append(header)
    story.append(Spacer(1, 0.2 * inch))

    parties = Table(
        [
            [
                Paragraph("<b>From</b>", label_style),
                Paragraph("<b>Bill To</b>", label_style),
            ],
            [
                Paragraph(
                    f"{_text(data['your_name'])}<br/>{_text(data['your_email'])}",
                    value_style,
                ),
                Paragraph(
                    f"{_text(data['client_name'])}<br/>"
                    f"{_text(data['client_email'])}<br/>"
                    f"{_text(data['client_address'])}",
                    value_style,
                ),
            ],
        ],
        colWidths=[3.35 * inch, 3.35 * inch],
    )
    parties.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story.append(parties)
    story.append(Spacer(1, 0.35 * inch))

    table_data = [
        ["Description", "Qty", "Rate", "Amount"],
    ]
    for item in data["services"]:
        table_data.append(
            [
                escape(item.get("description", "") or ""),
                str(item["qty"]),
                _money(float(item["rate"])),
                _money(item["total"]),
            ]
        )
    table_data.append(["", "", "Total", _money(data["grand_total"])])

    services_table = Table(
        table_data,
        colWidths=[3.2 * inch, 0.7 * inch, 1.2 * inch, 1.2 * inch],
    )
    services_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
                ("ALIGN", (0, 1), (0, -2), "LEFT"),
                ("GRID", (0, 0), (-1, -2), 0.5, colors.HexColor("#e2e8f0")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#f8fafc")]),
                ("FONTNAME", (2, -1), (-1, -1), "Helvetica-Bold"),
                ("BACKGROUND", (2, -1), (-1, -1), colors.HexColor("#f1f5f9")),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(services_table)

    if data.get("notes"):
        story.append(Spacer(1, 0.25 * inch))
        story.append(Paragraph("<b>Notes</b>", label_style))
        story.append(Paragraph(_text(data["notes"]), value_style))

    story.append(Spacer(1, 0.35 * inch))
    story.append(
        Paragraph(
            "Thank you for your business.",
            ParagraphStyle(
                "Footer",
                parent=styles["Normal"],
                fontSize=10,
                textColor=colors.HexColor("#475569"),
            ),
        )
    )

    doc.build(story)
    return buffer.getvalue()
