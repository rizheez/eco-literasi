import os
from fpdf import FPDF

class InvoicePDF(FPDF):
    def header(self):
        # Margin spacing
        self.ln(5)

    def footer(self):
        # Bottom text
        self.set_y(-20)
        self.set_text_color(120, 120, 120)
        self.set_font("helvetica", "I", 8)
        # self.cell(0, 10, "Terima kasih atas kepercayaan dan kerjasamanya dalam pengembangan proyek Eco-Dayak.", border=0, align="C")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    invoice_path = os.path.join(base_dir, "Invoice_Desain_Buku_Panduan.pdf")
    
    pdf = InvoicePDF(orientation="P", unit="mm", format="A4")
    pdf.set_margins(20, 20, 20)
    pdf.add_page()
    
    # Document Title (Charcoal gray)
    pdf.set_text_color(60, 60, 60)
    pdf.set_font("helvetica", "B", 26)
    pdf.cell(0, 12, "INVOICE / TAGIHAN", align="L")
    pdf.ln(15)
    
    # Metadata Block (Only Date, No Invoice Number)
    pdf.set_text_color(100, 100, 100)
    pdf.set_font("helvetica", "", 10)
    pdf.cell(100, 5, "Tanggal: 20 Juli 2026")
    pdf.ln(8)
    
    # Grey decorative line
    pdf.set_draw_color(160, 160, 160)
    pdf.set_line_width(0.8)
    pdf.line(20, pdf.get_y(), 190, pdf.get_y())
    pdf.ln(8)
    
    # Left: Kepada, Right: Dari
    pdf.set_text_color(100, 100, 100) # Grey for headings
    pdf.set_font("helvetica", "B", 12)
    curr_y = pdf.get_y()
    
    # Client Info (Left)
    pdf.set_xy(20, curr_y)
    pdf.cell(85, 6, "KEPADA YTH:")
    pdf.ln(6)
    pdf.set_text_color(60, 60, 60)
    pdf.set_font("helvetica", "", 10)
    pdf.set_x(20)
    pdf.multi_cell(80, 5, "Dr. Kartika Fajriani, S.Pd.I., M.Pd.\nProyek Eco-Dayak Literacy")
    
    # Vendor Info (Right)
    pdf.set_text_color(100, 100, 100)
    pdf.set_font("helvetica", "B", 12)
    pdf.set_xy(110, curr_y)
    pdf.cell(80, 6, "DARI (PENYEDIA JASA):")
    pdf.ln(6)
    pdf.set_text_color(60, 60, 60)
    pdf.set_font("helvetica", "", 10)
    pdf.set_x(110)
    pdf.multi_cell(80, 5, "Muhammad Abil Al-Ghifari\nPenyusun & Desainer Modul")
    
    pdf.ln(10)
    
    # Table Header (Grey Theme)
    pdf.set_fill_color(100, 100, 100) # Charcoal Grey header
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_draw_color(100, 100, 100)
    pdf.set_line_width(0.2)
    
    pdf.cell(8, 8, "No", border=1, fill=True, align="C")
    pdf.cell(102, 8, "Deskripsi Pekerjaan", border=1, fill=True, align="L")
    pdf.cell(20, 8, "Kuantitas", border=1, fill=True, align="C")
    pdf.cell(20, 8, "Satuan", border=1, fill=True, align="R")
    pdf.cell(20, 8, "Total", border=1, fill=True, align="R")
    pdf.ln(8)
    
    # Table Content
    pdf.set_text_color(60, 60, 60)
    pdf.set_font("helvetica", "", 9)
    pdf.set_draw_color(200, 200, 200)
    
    # Row 1
    row1_desc = "Pembuatan Desain Buku Panduan Model Eco-Dayak Literacy"
    
    curr_x = pdf.get_x()
    curr_y = pdf.get_y()
    
    pdf.cell(8, 24, "1", border=1, align="C")
    
    # Draw border for description
    pdf.set_xy(curr_x + 8, curr_y)
    pdf.cell(102, 24, "", border=1)
    
    # Draw text centered vertically and horizontally inside the cell
    pdf.set_xy(curr_x + 8, curr_y + 9.75)
    pdf.multi_cell(102, 4.5, row1_desc, border=0, align="C")
    
    pdf.set_xy(curr_x + 110, curr_y)
    pdf.cell(20, 24, "1 Paket", border=1, align="C")
    pdf.set_xy(curr_x + 130, curr_y)
    pdf.cell(20, 24, " ", border=1, align="R")
    pdf.cell(20, 24, " ", border=1, align="R")
    pdf.ln(24)
    
    # Row Total
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(130, 8, "TOTAL TAGIHAN", border=1, align="R")
    pdf.set_text_color(60, 60, 60)
    pdf.cell(40, 8, " ", border=1, align="R")
    pdf.ln(12)
    
    # Terbilang
    pdf.set_text_color(80, 80, 80)
    pdf.set_font("helvetica", "I", 10)
    pdf.cell(0, 6, "Terbilang: ")
    pdf.ln(10)
    
    # Save the PDF
    pdf.output(invoice_path)
    print(f"Invoice PDF berhasil dibuat di: {invoice_path}")

if __name__ == "__main__":
    main()
