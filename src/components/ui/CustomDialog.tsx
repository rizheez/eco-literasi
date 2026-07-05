import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, HelpCircle, Check } from 'lucide-react';
import { playSound } from '../../utils/audio';

interface CustomDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'alert' | 'confirm' | 'danger';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const CustomDialog: React.FC<CustomDialogProps> = ({
  isOpen,
  title,
  message,
  type = 'confirm',
  confirmText = 'Ya',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
}) => {
  // Play sound effect on dialog open
  React.useEffect(() => {
    if (isOpen) {
      if (type === 'danger') {
        playSound('error');
      } else {
        playSound('pop');
      }
    }
  }, [isOpen, type]);

  const handleConfirm = () => {
    playSound('success');
    onConfirm();
  };

  const handleCancel = () => {
    playSound('click');
    if (onCancel) onCancel();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={type !== 'alert' ? handleCancel : undefined}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className={`relative z-10 w-full max-w-md bg-white rounded-3xl p-6 border-4 shadow-2xl pointer-events-auto ${
              type === 'danger'
                ? 'border-rose-400'
                : type === 'alert'
                ? 'border-amber-400'
                : 'border-emerald-400'
            }`}
          >
            {/* Header Icon & Title */}
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`p-2.5 rounded-2xl ${
                  type === 'danger'
                    ? 'bg-rose-50 text-rose-500'
                    : type === 'alert'
                    ? 'bg-amber-50 text-amber-500'
                    : 'bg-emerald-50 text-emerald-500'
                }`}
              >
                {type === 'danger' ? (
                  <AlertCircle size={24} />
                ) : type === 'alert' ? (
                  <AlertCircle size={24} />
                ) : (
                  <HelpCircle size={24} />
                )}
              </div>
              <h3
                className={`text-2xl font-black ${
                  type === 'danger'
                    ? 'text-rose-950'
                    : type === 'alert'
                    ? 'text-amber-950'
                    : 'text-emerald-950'
                }`}
              >
                {title}
              </h3>
            </div>

            {/* Message */}
            <p className="text-slate-600 font-bold text-base leading-relaxed mb-6">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3">
              {type !== 'alert' && (
                <button
                  onClick={handleCancel}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-2xl transition cursor-pointer"
                >
                  {cancelText}
                </button>
              )}

              <button
                onClick={handleConfirm}
                className={`px-6 py-3 text-white font-black text-sm rounded-2xl flex items-center space-x-1.5 shadow-md btn-bouncy transition cursor-pointer ${
                  type === 'danger'
                    ? 'bg-rose-500 hover:bg-rose-600 shadow-playful-rose'
                    : type === 'alert'
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-playful-secondary'
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-playful-primary'
                }`}
              >
                {type === 'alert' ? (
                  <>
                    <span>Oke</span>
                    <Check size={16} />
                  </>
                ) : (
                  <>
                    <span>{confirmText}</span>
                    <Check size={16} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
