import os
import re
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

def clean_txt(text):
    # Map common unicode punctuation to ascii equivalents
    text = text.replace('\u2013', '-').replace('\u2014', '--')
    text = text.replace('\u2018', "'").replace('\u2019', "'")
    text = text.replace('\u201c', '"').replace('\u201d', '"')
    text = text.replace('✓', 'Y').replace('✔', 'Y')
    # Remove all emojis and unicode symbols
    return text.encode('ascii', errors='ignore').decode('ascii').strip()

def add_title_slide(prs, title, subtitle, audience):
    # Blank layout
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    
    # Background color - Dark Green
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = RGBColor(15, 76, 58) # #0F4C3A
    
    # Title Text Frame
    txBox = slide.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.33), Inches(2.2))
    tf = txBox.text_frame
    tf.word_wrap = True
    
    p1 = tf.paragraphs[0]
    p1.text = clean_txt(title)
    p1.font.name = "Arial"
    p1.font.bold = True
    p1.font.size = Pt(40)
    p1.font.color.rgb = RGBColor(255, 255, 255) # White
    p1.alignment = PP_ALIGN.CENTER
    
    # Subtitle
    if subtitle:
        p2 = tf.add_paragraph()
        p2.text = clean_txt(subtitle)
        p2.font.name = "Arial"
        p2.font.bold = True
        p2.font.size = Pt(22)
        p2.font.color.rgb = RGBColor(218, 165, 32) # Gold
        p2.space_before = Pt(15)
        p2.alignment = PP_ALIGN.CENTER
        
    # Audience & Footer
    txBox2 = slide.shapes.add_textbox(Inches(1.0), Inches(4.8), Inches(11.33), Inches(1.5))
    tf2 = txBox2.text_frame
    tf2.word_wrap = True
    
    p3 = tf2.paragraphs[0]
    p3.text = clean_txt(audience)
    p3.font.name = "Arial"
    p3.font.italic = True
    p3.font.size = Pt(16)
    p3.font.color.rgb = RGBColor(220, 220, 220)
    p3.alignment = PP_ALIGN.CENTER
    
    p4 = tf2.add_paragraph()
    p4.text = "Eco-Dayak Literacy - Belajar Budaya & Lingkungan Kalimantan Timur"
    p4.font.name = "Arial"
    p4.font.size = Pt(12)
    p4.font.color.rgb = RGBColor(180, 180, 180)
    p4.space_before = Pt(20)
    p4.alignment = PP_ALIGN.CENTER

def add_content_slide_with_image(prs, title, points, img_path=None):
    # Blank layout
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    
    # Background color - Very light cream/green
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = RGBColor(245, 248, 246)
    
    # Decorative Header Band
    header_band = slide.shapes.add_shape(
        1, # MSO_SHAPE.RECTANGLE is 1
        Inches(0), Inches(0), Inches(13.333), Inches(1.3)
    )
    header_band.fill.solid()
    header_band.fill.fore_color.rgb = RGBColor(15, 76, 58)
    header_band.line.fill.background()
    
    # Slide Title
    txBox = slide.shapes.add_textbox(Inches(0.75), Inches(0.2), Inches(11.83), Inches(0.9))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = clean_txt(title)
    p.font.name = "Arial"
    p.font.bold = True
    p.font.size = Pt(30)
    p.font.color.rgb = RGBColor(218, 165, 32) # Gold
    
    # Determine columns based on image availability
    has_valid_img = img_path and os.path.exists(img_path)
    text_width = Inches(7.0) if has_valid_img else Inches(11.83)
    
    # Bullet points text frame (Left Column)
    txBox2 = slide.shapes.add_textbox(Inches(0.75), Inches(1.8), text_width, Inches(5.0))
    tf2 = txBox2.text_frame
    tf2.word_wrap = True
    
    first = True
    for pt in points:
        text, level = pt
        if first:
            p_pt = tf2.paragraphs[0]
            first = False
        else:
            p_pt = tf2.add_paragraph()
            
        p_pt.text = clean_txt(text)
        p_pt.level = level
        p_pt.font.name = "Arial"
        
        if level == 0:
            p_pt.font.size = Pt(18)
            p_pt.font.bold = True
            p_pt.font.color.rgb = RGBColor(15, 76, 58) # Green
            p_pt.space_before = Pt(8)
        else:
            p_pt.font.size = Pt(14)
            p_pt.font.color.rgb = RGBColor(60, 60, 60) # Dark grey
            p_pt.space_before = Pt(3)
            
        p_pt.space_after = Pt(3)
        
    # Right Column Image
    if has_valid_img:
        # Position image on the right (Width: 4.5 in, Height: 4.5 in centered vertically)
        slide.shapes.add_picture(img_path, Inches(8.2), Inches(1.8), Inches(4.3), Inches(4.5))

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    ppt_path = os.path.join(base_dir, "Sosialisasi_Panduan_Eco_Dayak.pptx")
    images_dir = os.path.join(base_dir, "..", "public", "images")
    
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    # Helper to resolve image paths
    def get_img(filename):
        return os.path.normpath(os.path.join(images_dir, filename))
    
    # Slide 1: Cover (Practical Usage Guide)
    add_title_slide(
        prs,
        title="PANDUAN PENGGUNAAN APLIKASI",
        subtitle="Langkah Praktis Pendampingan Belajar Anak",
        audience="Panduan Langkah Demi Langkah bagi Guru PAUD/TK dan Orang Tua"
    )
    
    # Slide 2: Langkah 1: Membuka Aplikasi
    add_content_slide_with_image(
        prs,
        title="Langkah 1: Cara Membuka & Menjalankan",
        points=[
            ("Membuka Aplikasi Secara Offline (Luring)", 0),
            ("Aplikasi ini dapat dijalankan penuh tanpa koneksi internet sehingga aman dari iklan.", 1),
            ("Penggunaan di Komputer atau Laptop (Windows):", 0),
            ("Cari file aplikasi (.exe) yang sudah terpasang di komputer.", 1),
            ("Klik dua kali file tersebut untuk langsung masuk ke halaman pemuatan.", 1),
            ("Penggunaan di HP atau Tablet (Android):", 0),
            ("Ketuk ikon aplikasi Eco-Dayak di menu utama HP/Tablet.", 1),
            ("Ketuk tombol 'Mulai Bermain!' di Loading Screen saat aplikasi sudah siap.", 1)
        ],
        img_path=get_img("anak_dayak_cowo.png")
    )
    
    # Slide 3: Langkah 2: Membuat Profil Belajar Anak
    add_content_slide_with_image(
        prs,
        title="Langkah 2: Membuat Profil Pertama Kali",
        points=[
            ("Setup Profil Belajar Anak", 0),
            ("Ketika pertama kali bermain, anak diarahkan untuk membuat akun belajar lokalan.", 1),
            ("1. Masukkan Nama Panggilan:", 0),
            ("Ketik nama anak di kolom yang disediakan (maksimal 15 karakter).", 1),
            ("2. Pilih Karakter Petualang:", 0),
            ("Anak dapat memilih karakter maskot anak laki-laki atau anak perempuan Dayak.", 1),
            ("3. Mulai Belajar:", 0),
            ("Ketuk tombol 'Mulai Belajar!' untuk menyimpan profil dan masuk ke peta petualangan.", 1)
        ],
        img_path=get_img("ss_home.png")
    )
    
    # Slide 4: Langkah 3: Menavigasi Menu Utama (Home)
    add_content_slide_with_image(
        prs,
        title="Langkah 3: Menavigasi Menu Utama (Home)",
        points=[
            ("Memahami Elemen Layar Menu Utama", 0),
            ("Setelah membuat profil, anak akan masuk ke halaman depan aplikasi:", 1),
            ("Profil Belajar (Kiri Atas):", 0),
            ("Menampilkan foto avatar, nama anak, level saat ini, dan jumlah akumulasi bintang.", 1),
            ("Maskot Bantuan 'Enggo' (Tengah):", 0),
            ("Ketuk maskot Burung Enggang untuk mendengarkan panduan suara bantuan.", 1),
            ("Akses Modul Belajar:", 0),
            ("Ketuk salah satu dari 4 menu utama: Eksplorasi, Konstruksi, Internalisasi, atau Aksi.", 1)
        ],
        img_path=get_img("ss_home.png")
    )
    
    # Slide 5: Fitur 1: Eksplorasi Budaya & Alam
    add_content_slide_with_image(
        prs,
        title="Fitur 1: Eksplorasi Peta Pengetahuan",
        points=[
            ("Cara Belajar di Peta Eksplorasi:", 0),
            ("1. Ketuk ikon objek budaya/satwa pada peta Kalimantan Timur.", 1),
            ("2. Dengarkan cerita deskripsi singkat dan pesan ekologis dari narator.", 1),
            ("3. Dapatkan bintang setelah mendengarkan cerita hingga selesai.", 1),
            ("Peran Penting Guru & Orang Tua:", 0),
            ("Setelah anak membaca, tanyakan pertanyaan refleksi pendukung di Buku Panduan.", 1),
            ("Diskusikan mengapa hewan Kalimantan bisa punah jika pohon ditebang liar.", 1)
        ],
        img_path=get_img("ss_eksplorasi.png")
    )
    
    # Slide 6: Fitur 2: Konstruksi Bahasa & Cerita
    add_content_slide_with_image(
        prs,
        title="Fitur 2: Konstruksi Bahasa & Dongeng",
        points=[
            ("Membaca Dongeng & Melatih Pelafalan Kata", 0),
            ("1. Menyimak Dongeng Interaktif:", 1),
            ("Dengarkan 3 petualangan dongeng hewan Kalimantan (Pongo, Pesut, Enggang Cerdik).", 2),
            ("Jawab kuis pemahaman bacaan di akhir cerita untuk melatih fokus anak.", 2),
            ("2. Kamus Kosakata & Rekam Suara:", 1),
            ("Ketuk kosakata penting (Lamin, Sape, Hutan, Sungai) untuk mendengar pengucapannya.", 2),
            ("Tekan tombol mikrofon dan ajak anak menirukan pelafalan kata secara verbal.", 2)
        ],
        img_path=get_img("ss_konstruksi.png")
    )
    
    # Slide 7: Fitur 3: Internalisasi Nilai Eco
    add_content_slide_with_image(
        prs,
        title="Fitur 3: Simulasi Sebab-Akibat",
        points=[
            ("Memahami Dampak Tindakan Manusia terhadap Hutan & Sungai", 0),
            ("1. Memilih Tindakan:", 1),
            ("Anak dihadapkan pada pilihan moral (menjaga hutan vs tebang liar, dll).", 2),
            ("2. Melihat Konsekuensi Lingkungan:", 1),
            ("Konsekuensi visual langsung ditampilkan (sungai kotor vs sungai bersih gembira).", 2),
            ("3. Membuat Janji Hijau:", 1),
            ("Ketuk tombol 'Ya, Saya Berjanji!' untuk menanamkan komitmen menyayangi bumi.", 2)
        ],
        img_path=get_img("ss_internalisasi.png")
    )
    
    # Slide 8: Fitur 4: Aksi & Kreasi (Mini-Games)
    add_content_slide_with_image(
        prs,
        title="Fitur 4: Aksi & Kreasi Asah Otak",
        points=[
            ("Melatih Kognitif & Motorik Halus Lewat Game Edukasi", 0),
            ("1. Game Susun Huruf (Word Builder):", 1),
            ("Mengurutkan huruf acak menjadi kosakata yang tepat (S-A-P-E, L-A-M-I-N).", 2),
            ("2. Hubungkan Sebab-Akibat:", 1),
            ("Mencocokkan kartu tindakan dengan dampak ekologis yang sesuai.", 2),
            ("3. Puzzle Jigsaw Kalimantan:", 1),
            ("Menyusun pecahan gambar pemandangan Kalimantan hingga menyatu utuh.", 2),
            ("4. Game Memori Alam:", 1),
            ("Menemukan pasangan gambar alam yang tersembunyi di balik kartu acak.", 2)
        ],
        img_path=get_img("ss_aksi.png")
    )
    
    # Slide 9: Lembar Kerja Anak (LKA) Offline
    add_content_slide_with_image(
        prs,
        title="Melanjutkan Belajar Secara Fisik (LKA)",
        points=[
            ("Menerapkan Nilai Digital ke Dunia Nyata", 0),
            ("Cetak berkas 'Lembar Aktivitas Anak' untuk latihan fisik anak di atas kertas:", 1),
            ("1. Lembar Mewarnai: Mewarnai karakter Pongo, Pesut, Dayak Dara & Cilik.", 2),
            ("2. Hubungkan Garis: Latihan mencocokkan gambar benda dengan nama katanya.", 2),
            ("3. Tabel Komitmen Harian (Janji Hijau Offline):", 0),
            ("Pasang tabel janji hijau di dinding kamar anak.", 1),
            ("Beri tanda centang/bintang setiap kali anak membuang sampah, hemat air, dan merapikan mainan.", 1)
        ],
        img_path=get_img("anak_dayak.png")
    )
    
    # Slide 10: Tips Sukses untuk Guru & Orang Tua
    add_content_slide_with_image(
        prs,
        title="Tips Pendampingan Belajar",
        points=[
            ("1. Sesuaikan Pengaturan Suara:", 0),
            ("Gunakan menu pengaturan (ikon roda gigi) untuk mengecilkan musik sape latar agar suara panduan cerita terdengar lebih jelas.", 1),
            ("2. Hubungkan dengan Kehidupan Sehari-hari:", 0),
            ("Bimbing anak mempraktikkan kebiasaan membuang sampah dan mematikan kran air secara nyata setelah selesai bermain game.", 1),
            ("3. Berikan Apresiasi & Pujian:", 0),
            ("Apresiasi peningkatan level belajar anak agar mereka termotivasi melestarikan lingkungan.", 1)
        ],
        img_path=get_img("sungai_bersih.png")
    )
    
    try:
        prs.save(ppt_path)
        print(f"PPTX berhasil dibuat di: {ppt_path}")
    except PermissionError:
        alt_path = ppt_path.replace(".pptx", "_baru.pptx")
        prs.save(alt_path)
        print(f"File utama sedang dikunci/dibuka. PPTX disimpan di file alternatif: {alt_path}")

if __name__ == "__main__":
    main()
