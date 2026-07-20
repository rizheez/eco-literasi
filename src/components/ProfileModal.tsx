import React, { useState, useEffect } from 'react';
import { useChildStore } from '../store/useChildStore';
import { playSound, speakIndonesian } from '../utils/audio';
import { motion } from 'framer-motion';
import { Sparkles, Trash2, UserPlus } from 'lucide-react';
import { CustomDialog } from './ui/CustomDialog';

export const ProfileModal: React.FC = () => {
  const { childrenList, activeChild, createChild, selectChild, deleteChild, loadChildren } = useChildStore();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('/images/anak_dayak_cowo.png');
  const [isCreating, setIsCreating] = useState(false);
  const [showInvalidNameAlert, setShowInvalidNameAlert] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileToDeleteId, setProfileToDeleteId] = useState<number | null>(null);

  const avatars = ['/images/anak_dayak_cowo.png', '/images/anak_dayak_cewe.png'];

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize input: only allow letters, numbers, and spaces to prevent XSS in DB
    const sanitizedName = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    
    if (!sanitizedName) {
      setShowInvalidNameAlert(true);
      return;
    }
    
    playSound('success');
    await createChild(sanitizedName, selectedAvatar);
    speakIndonesian("Halo teman! Selamat datang di petualangan Eco Dayak.");
    setName('');
    setIsCreating(false);
  };

  const handleSelect = (id: number) => {
    playSound('pop');
    selectChild(id);
    speakIndonesian("Halo teman! Mari belajar lagi.");
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setProfileToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  if (activeChild) return null; // Hide if child is already selected

  return (
    <div className="fixed inset-0 bg-emerald-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border-4 border-emerald-400"
      >
        <h2 className="text-3xl font-extrabold text-emerald-800 text-center mb-6">
          {isCreating ? 'Buat Profil Petualang' : 'Pilih Profil Belajarmu'}
        </h2>

        {!isCreating ? (
          <div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {childrenList.map((child) => (
                <div
                  key={child.id}
                  onClick={() => handleSelect(child.id!)}
                  className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl cursor-pointer border-2 border-emerald-100 hover:border-emerald-400 transition shadow-playful hover:translate-y-[-2px]"
                >
                  <div className="flex items-center space-x-4">
                    {child.avatar.startsWith('/') ? (
                      <img src={child.avatar} alt="Avatar" className="w-16 h-20 object-contain" />
                    ) : (
                      <span className="text-4xl">{child.avatar}</span>
                    )}
                    <div>
                      <h3 className="font-bold text-xl text-emerald-900">{child.name}</h3>
                      <p className="text-emerald-600 text-sm font-semibold">Level {child.level} • ⭐ {child.totalStars} Bintang</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, child.id!)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                    title="Hapus Profil"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}

              {childrenList.length === 0 && (
                <p className="text-center text-slate-500 py-6 font-medium">Belum ada profil. Buat profil pertamamu di bawah!</p>
              )}
            </div>

            <button
              onClick={() => { playSound('click'); setIsCreating(true); }}
              className="mt-6 w-full py-4 bg-amber-500 text-white rounded-2xl font-bold text-xl flex items-center justify-center space-x-2 shadow-playful-secondary hover:brightness-110 btn-bouncy  transition-all cursor-pointer"
            >
              <UserPlus size={24} />
              <span>Buat Profil Baru</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-slate-700 font-bold text-lg mb-2">Siapa Namamu?</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={15}
                placeholder="Tulis namamu disini..."
                className="w-full px-4 py-3 rounded-2xl border-3 border-emerald-200 focus:border-emerald-500 focus:outline-none font-bold text-lg text-emerald-900 placeholder:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-lg mb-2">Pilih Karakter Maskotmu:</label>
              <div className="flex justify-center gap-6">
                {avatars.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => { playSound('pop'); setSelectedAvatar(av); }}
                    className={`w-28 h-40 rounded-3xl border-4 transition-all cursor-pointer flex items-center justify-center ${
                      selectedAvatar === av 
                        ? 'border-amber-500 bg-amber-100 scale-110' 
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {av.startsWith('/') ? (
                      <img src={av} alt="Avatar" className="w-24 h-32 object-contain" />
                    ) : (
                      <span className="text-5xl">{av}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              {childrenList.length > 0 && (
                <button
                  type="button"
                  onClick={() => { playSound('click'); setIsCreating(false); }}
                  className="w-1/3 py-4 bg-slate-200 text-slate-700 rounded-2xl font-bold text-lg transition hover:bg-slate-300 cursor-pointer"
                >
                  Kembali
                </button>
              )}
              <button
                type="submit"
                className={`py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 shadow-playful-primary hover:brightness-110 btn-bouncy  transition-all cursor-pointer ${
                  childrenList.length > 0 ? 'w-2/3' : 'w-full'
                }`}
              >
                <Sparkles size={20} />
                <span>Mulai Belajar!</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>

      <CustomDialog
        isOpen={showInvalidNameAlert}
        title="Nama Tidak Valid"
        message="Nama tidak valid. Gunakan huruf dan angka saja ya!"
        type="alert"
        onConfirm={() => setShowInvalidNameAlert(false)}
      />

      <CustomDialog
        isOpen={showDeleteConfirm}
        title="Hapus Profil"
        message="Apakah kamu yakin ingin menghapus profil ini? Semua bintang dan piala akan hilang."
        type="danger"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={async () => {
          if (profileToDeleteId !== null) {
            await deleteChild(profileToDeleteId);
            setProfileToDeleteId(null);
          }
          setShowDeleteConfirm(false);
        }}
        onCancel={() => {
          setProfileToDeleteId(null);
          setShowDeleteConfirm(false);
        }}
      />
    </div>
  );
};
