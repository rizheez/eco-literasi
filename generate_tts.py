import os
import re
import hashlib
import asyncio
import sys
import edge_tts

# Reconfigure stdout to UTF-8 on Windows to prevent UnicodeEncodeError in console
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

TEXTS = [
    # Settings & Progress
    "Suara panduan sekarang aktif!",
    "Halo! Saya adalah burung enggang cerdik, suara panduan belajarmu.",
    "Data belajar kamu sudah dibersihkan. Mari mulai dari awal!",
    
    # Greetings
    "Halo teman! Selamat datang di petualangan Eco Dayak.",
    "Halo teman! Mari belajar lagi.",
    "Ketuk gambar untuk mendengarkan cerita dan dapatkan bintang!",
    "Pelajari hubungan sebab-akibat perilaku manusia terhadap kelestarian alam.",
    "Pilih aktivitas untuk meningkatkan kosa kata dan keterampilan bicaramu!",
    "Gunakan bahasamu dan aksi cerdasmu untuk melestarikan alam Dayak!",
    
    # Konstruksi: Matching
    "Hebat sekali! Semua kata sudah tercocokkan. Kamu dapat dua bintang!",
    "Coba lagi, pasangannya belum tepat!",
    
    # Konstruksi: Pronunciation words and prompts
    "Katakan Enggang",
    "Katakan Lamin",
    "Katakan Hutan",
    "Katakan Sungai",
    "Katakan Sape",
    "Katakan Pesut",
    "Katakan Orangutan",
    
    "Enggang",
    "Lamin",
    "Hutan",
    "Sungai",
    "Sape",
    "Pesut",
    "Orangutan",
    
    # Konstruksi: Stories
    "Burung Enggang yang Baik Hati",
    "Di sebuah hutan yang rimbun di Kalimantan Timur, hiduplah seekor Burung Enggang bernama Cerdik. Suatu hari, Sungai Mahakam menjadi sangat kotor karena tumpukan sampah plastik. Cerdik terbang keliling hutan mengajak teman-temannya untuk bergotong royong membersihkan sungai. Akhirnya, sungai kembali jernih dan seluruh hewan hidup bahagia.",
    
    "Sahabat Pesut Mahakam",
    "Di perairan Sungai Mahakam yang jernih, hiduplah sekeluarga Pesut Mahakam. Pesut adalah lumba-lumba air tawar yang sangat ramah. Mereka sering membantu nelayan yang tersesat di sungai. Pesut sangat sedih jika manusia membuang sampah ke sungai. Mari kita jaga kebersihan sungai agar pesut tetap sehat!",
    
    "Pongo Orangutan yang Cerdas",
    "Di puncak pohon hutan Kalimantan yang lebat, hiduplah seekor orangutan bernama Pongo. Pongo sangat suka makan buah hutan yang lezat dan manis. Suatu hari, Pongo melihat asap tebal dari kejauhan. Pongo segera memanggil burung enggang untuk terbang memperingatkan hewan lain dan warga desa agar memadamkan api. Berkat kecerdasan Pongo, hutan mereka selamat dari bahaya kebakaran.",
    
    "Jawabanmu benar! Hebat sekali. Sekarang coba ceritakan kembali kisah ini.",
    "Kurang tepat. Coba pilih jawaban yang lain ya.",
    "Silakan ceritakan kembali kisah ini",
    "Terima kasih sudah menceritakan kembali! Kamu pintar bercerita. Dua bintang ditambahkan!",
    
    # Internalisasi Eco
    "Apa yang sebaiknya kita lakukan pada pohon-pohon di hutan?",
    "Bagaimana cara kita memperlakukan sungai agar tetap sehat?",
    
    "Oh tidak. Hutan Gundul dan Rusak 😢. Bila pohon ditebang habis dan dibakar, hewan seperti orangutan kehilangan rumahnya. Tanah akan longsor dan banjir bandang melanda saat hujan lebat.. Coba pilih tindakan yang baik ya.",
    "Hebat! Hutan Subur dan Hijau! 😍. Hutan yang rimbun menyerap air hujan untuk mencegah banjir, membersihkan udara agar sejuk, dan menjadi tempat hidup yang damai bagi satwa liar Kalimantan.. Sekarang mari berjanji untuk menyayangi bumi.",
    
    "Oh tidak. Sungai Kotor dan Tercemar 🤮. Sampah menyumbat aliran air, bau tidak sedap menyebar, pesut mahakam keracunan, dan ikan-ikan kecil bisa mati karena air yang tercemar racun sampah.. Coba pilih tindakan yang baik ya.",
    "Hebat! Sungai Bersih dan Indah! 🌟. Aliran air mengalir lancar, bebas dari banjir, pesut mahakam melompat gembira, dan ikan-ikan berenang sehat di air sungai yang jernih.. Sekarang mari berjanji untuk menyayangi bumi.",
    
    "Terima kasih sudah berjanji! Kamu anak hebat pelindung lingkungan. Dua bintang ditambahkan!",
    
    # Home stage clicks
    "Mari bermain Eksplorasi Budaya",
    "Mari bermain Konstruksi Bahasa",
    "Mari bermain Internalisasi Eco",
    "Mari bermain Aksi & Kreasi",
    
    # Eksplorasi Budaya
    "Burung Enggang. Burung Enggang adalah burung suci bagi masyarakat Dayak. Bulunya melambangkan kesucian dan perdamaian. Habitat Burung Enggang adalah di atas pohon-pohon tinggi di hutan lebat. Jika pohon ditebang, burung cantik ini tidak punya rumah lagi.",
    "Hutan Hujan. Hutan hujan Kalimantan adalah paru-paru dunia. Di sini tumbuh beraneka jenis pohon besar, bunga, dan buah liar. Menjaga hutan dari kebakaran dan pembalakan liar membantu menyeimbangkan suhu bumi serta menghindari banjir bandang.",
    "Orangutan Kaltim. Orangutan adalah kera besar berambut merah khas Kalimantan. Mereka sangat cerdas dan menghabiskan sebagian besar hidupnya di atas pohon. Ketika hutan ditebang atau dibakar, mereka kehilangan rumah dan makanan. Ayo lindungi hutan tempat tinggal orangutan!",
    "Sungai Mahakam. Sungai Mahakam adalah sungai terpanjang di Kalimantan Timur. Sungai ini menjadi sumber air kehidupan bagi tumbuhan, hewan, dan manusia. Sungai Mahakam harus dijaga agar airnya tetap bersih sehingga semua makhluk hidup bisa memanfaatkan airnya tanpa khawatir sakit.",
    "Pesut Mahakam. Pesut Mahakam adalah lumba-lumba air tawar ramah yang merupakan hewan endemik Sungai Mahakam. Jumlah mereka kini sangat sedikit. Membuang sampah plastik dan limbah ke sungai dapat meracuni air dan membahayakan pesut. Mari kita jaga sungai agar pesut tetap lestari!",
    "Rumah Lamin. Rumah Lamin adalah rumah adat suku Dayak berbentuk panggung panjang. Di sini, banyak keluarga tinggal bersama-sama. Rumah Lamin mengajarkan kita nilai gotong royong dan menjaga kebersihan pekarangan rumah bersama tetangga.",
    "Musik Tradisional Sape. Sape adalah alat musik petik tradisional Dayak yang suaranya merdu sekali seperti kicau burung di hutan. Suku Dayak memainkan Sape untuk mengungkapkan rasa syukur atas limpahan hasil panen dan keindahan alam ciptaan Tuhan.",
    
    "Hebat! Kamu mendapatkan dua bintang!",
    
    # Aksi & Kreasi: Wordbuilder
    "Susun kata: LAMIN. Petunjuk: Rumah Adat Dayak yang panjang",
    "Susun kata: SAPE. Petunjuk: Alat musik tradisional Dayak",
    "Susun kata: HUTAN. Petunjuk: Tempat tumbuhnya banyak pohon",
    "Susun kata: SUNGAI. Petunjuk: Aliran air bersih tempat pesut hidup",
    "Susun kata: PESUT. Petunjuk: Lumba-lumba air tawar Sungai Mahakam",
    "Susun kata: ORANGUTAN. Petunjuk: Kera besar berbulu merah khas Kaltim",
    "Susun kata: ENGGANG. Petunjuk: Burung suci lambang persatuan",
    
    "Benar! Kamu mengeja LAMIN dengan tepat. Dapat dua bintang!",
    "Benar! Kamu mengeja SAPE dengan tepat. Dapat dua bintang!",
    "Benar! Kamu mengeja HUTAN dengan tepat. Dapat dua bintang!",
    "Benar! Kamu mengeja SUNGAI dengan tepat. Dapat dua bintang!",
    "Benar! Kamu mengeja PESUT dengan tepat. Dapat dua bintang!",
    "Benar! Kamu mengeja ORANGUTAN dengan tepat. Dapat dua bintang!",
    "Benar! Kamu mengeja ENGGANG dengan tepat. Dapat dua bintang!",
    
    "Ejaannya belum pas. Ayo coba lagi!",
    
    # Aksi & Kreasi: Sebab-Akibat
    "Mari hubungkan tindakan dengan dampaknya terhadap alam.",
    "Betul! Pohon yang ditebang dan dibakar membuat tanah gundul, memicu banjir bandang, dan merusak tempat tinggal satwa liar.",
    "Betul! Menanam bibit pohon membantu menghijaukan hutan kembali sehingga menghasilkan udara bersih dan mencegah banjir.",
    "Betul! Sampah plastik mencemari air sungai, membuat pesut mahakam sedih, dan merusak ekosistem sungai.",
    "Betul! Sungai yang bersih membuat pesut mahakam dan ikan-ikan hidup sehat serta aliran air mengalir lancar.",
    
    "Hebat! Kamu berhasil mencocokkan semua sebab akibat dengan benar. Dapat dua bintang!",
    "Akibatnya belum cocok dengan tindakan ini. Ayo cari lagi!",
    
    # Aksi & Kreasi: Puzzle & Memory
    "Ayo susun puzzle alam Kalimantan. Ketuk dua pecahan gambar untuk menukar posisinya.",
    "Luar biasa! Gambar lingkungan berhasil terkumpul dengan rapi. Dapat dua bintang!",
    
    "Mari bermain memori alam. Temukan pasangan gambar yang sama.",
    "Luar biasa! Kamu berhasil memasangkan semua gambar alam. Dapat dua bintang!",
    
    "Kata ini berbunyi: LAMIN",
    "Kata ini berbunyi: SAPE",
    "Kata ini berbunyi: HUTAN",
    "Kata ini berbunyi: SUNGAI",
    "Kata ini berbunyi: PESUT",
    "Kata ini berbunyi: ORANGUTAN",
    "Kata ini berbunyi: ENGGANG",
    
    # Guide Texts
    "Halo! Aku Enggo, teman belajarmu! Ayo pilih salah satu menu petualangan di sebelah kiri atau bawah untuk mulai belajar, bermain game seru, dan mengumpulkan bintang!",
    "Di sini kita bisa melihat keindahan alam Kalimantan! Ketuk salah satu kartu untuk mendengarkan cerita menarik tentang budaya dan hewan-hewan kita. Selesai membaca akan dapat bintang!",
    "Ayo dengarkan cerita interaktif seru! Ketuk cerita yang kamu suka untuk mendengar petualangan Pongo dan sahabat-sahabatnya. Kamu juga bisa belajar mengeja kata di kamus kosakata!",
    "Ayo bantu aku memilih tindakan yang baik untuk bumi! Ketuk salah satu tombol pilihan untuk melihat dampaknya terhadap alam Kalimantan. Jangan lupa berjanji untuk menyayangi bumi ya!",
    "Waktunya bermain game seru! Ada susun huruf kosakata Dayak, mencocokkan sebab-akibat, menyusun puzzle alam, dan melatih memori. Setiap game yang selesai akan memberimu bintang!",
    "Wah, lihat semua pencapaian luar biasamu! Di sini kamu bisa melihat daftar tugas yang sudah selesai dan jumlah bintang serta medali yang berhasil kamu kumpulkan!",
    "Di menu pengaturan ini, kamu atau orang tuamu bisa mengatur besar kecilnya volume musik latar dan volume suara pemandu, atau menghapus data jika ingin mengulang dari awal.",
]

VOICE = "id-ID-GadisNeural"
OUTPUT_DIR = "public/audio/tts"

def clean_speech_text(text: str) -> str:
    # Strip emojis (mathematically equivalent to JS UTF-16 surrogate ranges in Python Unicode)
    emoji_pattern = re.compile(
        r'[\u2700-\u27BF]|[\uE000-\uF8FF]|[\u2011-\u26FF]|'
        r'[\U0001F000-\U0001F3FF]|[\U0001F400-\U0001F7FF]|[\U0001F910-\U0001F9FF]'
    )
    cleaned = emoji_pattern.sub('', text)
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned.strip()

def get_hash(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

async def generate_single(text: str):
    cleaned = clean_speech_text(text)
    if not cleaned:
        return
    
    file_hash = get_hash(cleaned)
    output_path = os.path.join(OUTPUT_DIR, f"{file_hash}.mp3")
    
    if os.path.exists(output_path):
        # Do not print full path to keep console clean, but print success
        return

    print(f"Generating: '{cleaned[:50]}...' -> {file_hash}.mp3")
    
    communicate = edge_tts.Communicate(cleaned, VOICE, rate="-12%", pitch="+10Hz")
    
    try:
        await communicate.save(output_path)
    except Exception as e:
        print(f"Error generating '{cleaned[:30]}': {e}")

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    # Deduplicate
    seen_hashes = set()
    unique_texts = []
    for t in TEXTS:
        h = get_hash(clean_speech_text(t))
        if h not in seen_hashes:
            seen_hashes.add(h)
            unique_texts.append(t)

    print(f"Starting TTS generation for {len(unique_texts)} unique text strings...")
    
    for i, text in enumerate(unique_texts):
        await generate_single(text)
        await asyncio.sleep(0.1)
        
    print("All TTS files successfully generated!")

    # Automatically clean up orphaned/unused MP3 files
    print("Checking for orphaned/unused TTS files...")
    active_hashes = {get_hash(clean_speech_text(t)) for t in unique_texts}
    cleaned_count = 0

    if os.path.exists(OUTPUT_DIR):
        for filename in os.listdir(OUTPUT_DIR):
            if filename.endswith(".mp3"):
                file_hash = filename[:-4] # Remove '.mp3'
                if file_hash not in active_hashes:
                    file_path = os.path.join(OUTPUT_DIR, filename)
                    print(f"Removing unused TTS file: {filename}")
                    try:
                        os.remove(file_path)
                        cleaned_count += 1
                    except Exception as e:
                        print(f"Error removing {filename}: {e}")
    
    if cleaned_count > 0:
        print(f"Cleaned up {cleaned_count} unused/orphaned TTS files!")
    else:
        print("No orphaned TTS files found. Directory is clean!")

if __name__ == "__main__":
    asyncio.run(main())
