import os
import re
from fpdf import FPDF

# Reconfigure stdout to UTF-8 on Windows
import sys
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

class EcoDayakPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_text_color(15, 76, 58) # Green #0F4C3A
            self.set_font("helvetica", "B", 8)
            self.cell(170, 10, "Buku Panduan & Modul Pembelajaran Eco-Dayak Literacy", border=0, align="R")
            self.ln(10)
            self.set_draw_color(15, 76, 58)
            self.set_line_width(0.3)
            self.line(20, 17, 190, 17)
            self.ln(2)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-15)
            self.set_line_width(0.2)
            self.set_draw_color(180, 180, 180)
            self.line(20, self.get_y(), 190, self.get_y())
            self.set_text_color(120, 120, 120)
            self.set_font("helvetica", "I", 8)
            self.cell(170, 10, f"Halaman {self.page_no()}", border=0, align="C")

def remove_markdown_syntax(text):
    # Convert markdown links [Text](URL) -> Text
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    # Convert inline code `code` -> code
    text = re.sub(r'`([^`]+)`', r'\1', text)
    # Convert bold **text** -> text
    text = text.replace('**', '')
    # Convert italic *text* or _text_ -> text
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'_([^_]+)_', r'\1', text)
    return text

def clean_txt(text):
    # Remove markdown syntax
    text = remove_markdown_syntax(text)
    # Map common unicode punctuation to ascii equivalents
    text = text.replace('\u2013', '-').replace('\u2014', '--')
    text = text.replace('\u2018', "'").replace('\u2019', "'")
    text = text.replace('\u201c', '"').replace('\u201d', '"')
    text = text.replace('✓', 'Y').replace('✔', 'Y')
    # Remove all emojis and unicode symbols
    return text.encode('ascii', errors='ignore').decode('ascii').strip()

def create_cover_page(pdf):
    pdf.add_page()
    
    # Border
    pdf.set_draw_color(15, 76, 58)
    pdf.set_line_width(1)
    pdf.rect(10, 10, 190, 277)
    pdf.rect(12, 12, 186, 273)
    
    # Title Green
    pdf.set_text_color(15, 76, 58)
    pdf.ln(50)
    pdf.set_font("helvetica", "B", 24)
    pdf.multi_cell(170, 12, "BUKU PANDUAN &\nMODUL PEMBELAJARAN", align="C")
    
    # Decorative line
    pdf.ln(5)
    pdf.set_draw_color(218, 165, 32) # Gold
    pdf.set_line_width(2)
    pdf.line(50, pdf.get_y(), 160, pdf.get_y())
    
    # Subtitle Gold
    pdf.ln(10)
    pdf.set_text_color(218, 165, 32)
    pdf.set_font("helvetica", "B", 16)
    pdf.cell(170, 10, "Aplikasi Edukasi Eco-Dayak Literacy", align="C")
    pdf.ln(10)
    
    # Audience
    pdf.ln(35)
    pdf.set_text_color(80, 80, 80)
    pdf.set_font("helvetica", "I", 12)
    pdf.cell(170, 10, "Untuk Guru PAUD/TK dan Orang Tua", align="C")
    pdf.ln(10)
    
    # Bottom details
    pdf.ln(50)
    pdf.set_text_color(100, 100, 100)
    pdf.set_font("helvetica", "", 10)
    pdf.cell(170, 5, "Fokus: Integrasi Literasi Bahasa & Eco-Literacy", align="C")
    pdf.ln(5)
    pdf.cell(170, 5, "Berbasis Kearifan Lokal Kalimantan Timur", align="C")
    pdf.ln(5)
    pdf.cell(170, 5, "Tahun 2026", align="C")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    md_path = os.path.join(base_dir, "Buku_Panduan_Lengkap.md")
    pdf_path = os.path.join(base_dir, "Buku_Panduan_Lengkap.pdf")
    
    pdf = EcoDayakPDF(orientation="P", unit="mm", format="A4")
    pdf.set_margins(20, 20, 20)
    pdf.set_auto_page_break(auto=True, margin=20)
    
    create_cover_page(pdf)
    
    # Add a page for the main content
    pdf.add_page()
    
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    in_code_block = False
    code_content = []
    
    for line in lines:
        line_str = line.strip()
        
        # Skip empty lines, but add spacing
        if not line_str:
            if in_code_block:
                code_content.append("")
            else:
                pdf.ln(3)
            continue
            
        # Code block handler
        if line_str.startswith("```"):
            if in_code_block:
                pdf.set_font("courier", "", 9)
                pdf.set_fill_color(245, 245, 245)
                pdf.set_text_color(50, 50, 50)
                block_text = "\n".join(code_content)
                block_text = clean_txt(block_text)
                pdf.multi_cell(170, 5, block_text, border=1, fill=True)
                pdf.ln(4)
                in_code_block = False
                code_content = []
            else:
                in_code_block = True
            continue
            
        if in_code_block:
            code_content.append(line.rstrip('\n'))
            continue
            
        # Image Parsing: ![Caption](path)
        match_img = re.match(r'^!\[([^\]]*)\]\(([^\)]+)\)$', line_str)
        if match_img:
            caption = match_img.group(1)
            img_path = match_img.group(2)
            
            # Resolve image path
            abs_img_path = os.path.join(base_dir, "..", "public", img_path.lstrip("/"))
            abs_img_path = os.path.normpath(abs_img_path)
            
            if os.path.exists(abs_img_path):
                try:
                    from PIL import Image
                    with Image.open(abs_img_path) as im:
                        w_pixels, h_pixels = im.size
                    aspect = h_pixels / w_pixels
                    
                    # Enlarge screenshots (ss_*) and shrink topic illustrations/cause-effect
                    filename = os.path.basename(img_path)
                    if filename.startswith("ss_"):
                        w_mm = 135  # Larger screenshots
                    else:
                        w_mm = 45   # Smaller topic illustrations
                        
                    h_mm = aspect * w_mm
                    
                    # Center the image
                    x_pos = 20 + (170 - w_mm) / 2
                    
                    # Check space on page
                    if pdf.get_y() + h_mm > 260:
                        pdf.add_page()
                        
                    pdf.image(abs_img_path, x=x_pos, y=pdf.get_y(), w=w_mm)
                    pdf.ln(h_mm + 4) # advance y by height + spacing
                except Exception as e:
                    print(f"Gagal menyisipkan gambar {img_path}: {e}")
            continue
            
        # Header Parsing (Supports # to ######)
        match_header = re.match(r'^(#{1,6})\s+(.*)$', line_str)
        if match_header:
            level = len(match_header.group(1))
            title_text = clean_txt(match_header.group(2))
            
            # Page breaks for level 1 and level 2 (BAB) headers
            if level == 1 and pdf.page_no() > 2:
                pdf.add_page()
            elif level == 2 and title_text.startswith("BAB") and pdf.page_no() > 2:
                pdf.add_page()
                
            if level == 1:
                pdf.set_font("helvetica", "B", 18)
                pdf.set_text_color(15, 76, 58) # Dark Green
                h_space = 10
            elif level == 2:
                pdf.set_font("helvetica", "B", 14)
                pdf.set_text_color(15, 76, 58) # Dark Green
                h_space = 8
            elif level == 3:
                pdf.set_font("helvetica", "B", 11)
                pdf.set_text_color(218, 165, 32) # Gold
                h_space = 6
            else: # level 4, 5, 6
                pdf.set_font("helvetica", "B", 10)
                pdf.set_text_color(15, 76, 58) # Dark Green
                h_space = 5
                
            pdf.multi_cell(170, h_space, title_text)
            pdf.ln(2)
            continue
            
        # Bullet list items
        if line_str.startswith("* ") or line_str.startswith("- "):
            item_text = clean_txt(line_str[2:])
            pdf.set_font("helvetica", "", 10)
            pdf.set_text_color(33, 37, 41)
            
            # Indent based on leading spaces (e.g. nested lists in Daftar Isi)
            leading_spaces = len(line) - len(line.lstrip(' '))
            indent = 25
            if leading_spaces >= 5:
                indent = 38
            elif leading_spaces >= 2:
                indent = 30
                
            pdf.set_x(indent)
            pdf.multi_cell(190 - indent, 5, "- " + item_text)
            pdf.set_x(20) # Reset margin
            continue
            
        # Numbered list items
        match_num = re.match(r'^(\d+)\.\s+(.*)$', line_str)
        if match_num:
            num = match_num.group(1)
            item_text = clean_txt(match_num.group(2))
            pdf.set_font("helvetica", "", 10)
            pdf.set_text_color(33, 37, 41)
            
            leading_spaces = len(line) - len(line.lstrip(' '))
            indent = 25
            if leading_spaces >= 5:
                indent = 38
            elif leading_spaces >= 2:
                indent = 30
                
            pdf.set_x(indent)
            pdf.multi_cell(190 - indent, 5, f"{num}. {item_text}")
            pdf.set_x(20) # Reset margin
            continue
            
        # Horizontal rules
        if line_str == "---":
            pdf.ln(2)
            pdf.set_draw_color(218, 165, 32)
            pdf.set_line_width(0.5)
            curr_y = pdf.get_y()
            pdf.line(20, curr_y, 190, curr_y)
            pdf.ln(3)
            continue
            
        # Normal paragraph text
        is_bold = line_str.startswith("**") and line_str.endswith("**")
        para_text = clean_txt(line_str)
        if para_text:
            pdf.set_font("helvetica", "", 10)
            pdf.set_text_color(33, 37, 41)
            
            if is_bold:
                pdf.set_font("helvetica", "B", 10)
            
            pdf.multi_cell(170, 5.5, para_text)
            
            if is_bold:
                pdf.set_font("helvetica", "", 10) # Reset
                
    pdf.output(pdf_path)
    print(f"PDF berhasil dibuat di: {pdf_path}")

if __name__ == "__main__":
    main()
