import os
from fpdf import FPDF

class InvoicePDF(FPDF):
    def header(self):
        # No green banner background, just a top margin spacing
        self.ln(5)

    def footer(self):
        # Bottom text
        self.set_y(-20)
        self.set_text_color(120, 120, 120)
        self.set_font("helvetica", "I", 8)
        # self.cell(0, 10, "Terima kasih atas kepercayaan dan kerjasamanya dalam pengembangan proyek Eco-Dayak.", border=0, align="C")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    invoice_path = os.path.join(base_dir, "Invoice_Eco_Dayak_Literacy.pdf")
    
    pdf = InvoicePDF(orientation="P", unit="mm", format="A4")
    pdf.set_margins(20, 20, 20)
    pdf.add_page()
    
    # Document Title (Using Charcoal color instead of Green since we removed banner)
    pdf.set_text_color(33, 37, 41)
    pdf.set_font("helvetica", "B", 26)
    pdf.cell(0, 12, "INVOICE / TAGIHAN", align="L")
    pdf.ln(15)
    
    # Metadata Block (Only Date, No Invoice Number)
    pdf.set_text_color(100, 100, 100)
    pdf.set_font("helvetica", "", 10)
    pdf.cell(100, 5, "Tanggal: 20 Juli 2026")
    pdf.ln(8)
    
    # Gold decorative line
    pdf.set_draw_color(218, 165, 32) # Gold
    pdf.set_line_width(0.8)
    pdf.line(20, pdf.get_y(), 190, pdf.get_y())
    pdf.ln(8)
    
    # Left: Kepada, Right: Dari
    pdf.set_text_color(15, 76, 58) # Green for headings
    pdf.set_font("helvetica", "B", 12)
    curr_y = pdf.get_y()
    
    # Client Info (Left)
    pdf.set_xy(20, curr_y)
    pdf.cell(85, 6, "KEPADA YTH:")
    pdf.ln(6)
    pdf.set_text_color(33, 37, 41)
    pdf.set_font("helvetica", "", 10)
    pdf.set_x(20)
    pdf.multi_cell(80, 5, "Dr. Kartika Fajriani, S.Pd.I., M.Pd.\nProyek Eco-Dayak Literacy")
    
    # Vendor Info (Right)
    pdf.set_text_color(15, 76, 58)
    pdf.set_font("helvetica", "B", 12)
    pdf.set_xy(110, curr_y)
    pdf.cell(80, 6, "DARI (PENYEDIA JASA):")
    pdf.ln(6)
    pdf.set_text_color(33, 37, 41)
    pdf.set_font("helvetica", "", 10)
    pdf.set_x(110)
    pdf.multi_cell(80, 5, "Muhammad Reza Saputra\nPengembang Software Eco-Dayak Literacy")
    
    pdf.ln(10)
    
    # Table Header
    pdf.set_fill_color(15, 76, 58)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("helvetica", "B", 10)
    pdf.set_draw_color(15, 76, 58)
    pdf.set_line_width(0.2)
    
    pdf.cell(8, 8, "No", border=1, fill=True, align="C")
    pdf.cell(102, 8, "Deskripsi Pekerjaan", border=1, fill=True, align="L")
    pdf.cell(20, 8, "Kuantitas", border=1, fill=True, align="C")
    pdf.cell(20, 8, "Satuan", border=1, fill=True, align="R")
    pdf.cell(20, 8, "Total", border=1, fill=True, align="R")
    pdf.ln(8)
    
    # Table Content
    pdf.set_text_color(33, 37, 41)
    pdf.set_font("helvetica", "", 9)
    pdf.set_draw_color(200, 200, 200)
    
    # Row 1
    row1_desc = "Pengembangan Aplikasi & Pembuatan Sistem Edukasi Eco-Dayak Literacy\n- Pembuatan aplikasi interaktif untuk anak PAUD (4-6 tahun)\n- Integrasi suara panduan cerita luring (Text-to-Speech)\n- Konfigurasi Desktop App (Windows) dan Mobile App (Android APK)"
    
    curr_x = pdf.get_x()
    curr_y = pdf.get_y()
    
    pdf.cell(8, 28, "1", border=1, align="C")
    
    pdf.set_xy(curr_x + 8, curr_y)
    pdf.multi_cell(102, 4.5, row1_desc, border=1)
    
    pdf.set_xy(curr_x + 110, curr_y)
    pdf.cell(20, 28, "1 Paket", border=1, align="C")
    pdf.set_xy(curr_x + 130, curr_y)
    pdf.cell(20, 28, "Rp 2.000.000", border=1, align="R")
    pdf.cell(20, 28, "Rp 2.000.000", border=1, align="R")
    pdf.ln(28)
    
    # Row Total
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(130, 8, "TOTAL TAGIHAN", border=1, align="R")
    pdf.set_text_color(15, 76, 58)
    pdf.cell(40, 8, "Rp 2.000.000", border=1, align="R")
    pdf.ln(12)
    
    # Terbilang
    pdf.set_text_color(33, 37, 41)
    pdf.set_font("helvetica", "I", 10)
    pdf.cell(0, 6, "Terbilang: Dua Juta Rupiah")
    pdf.ln(10)
    
    # Payment Method Details
    pdf.set_fill_color(245, 248, 246)
    curr_x = pdf.get_x()
    curr_y = pdf.get_y()
    pdf.rect(curr_x, curr_y, 170, 24, "F")
    
    pdf.set_xy(curr_x + 4, curr_y + 3)
    pdf.set_text_color(15, 76, 58)
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(0, 5, "METODE PEMBAYARAN TRANSFER:")
    pdf.ln(5)
    pdf.set_text_color(33, 37, 41)
    pdf.set_font("helvetica", "", 9)
    pdf.set_x(curr_x + 4)
    pdf.cell(0, 4.5, "Nama Bank: Bank BSI")
    pdf.ln(4.5)
    pdf.set_x(curr_x + 4)
    pdf.cell(0, 4.5, "Nomor Rekening: 7334919937")
    pdf.ln(4.5)
    pdf.set_x(curr_x + 4)
    pdf.cell(0, 4.5, "Atas Nama: Muhammad Reza Saputra")
    
    # Save the PDF
    pdf.output(invoice_path)
    print(f"Invoice PDF berhasil dibuat di: {invoice_path}")

if __name__ == "__main__":
    main()
