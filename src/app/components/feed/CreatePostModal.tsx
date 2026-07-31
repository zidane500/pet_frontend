import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { useCreatePost } from "../../../hooks/usePosts";
import { uploadApi } from "../../../api/upload";

interface PendingPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

interface CreatePostModalProps {
  onClose: () => void;
  onCreated?: () => void;
}

const MAX_PHOTOS = 5;
const MAX_CONTENT_LENGTH = 2000;

export function CreatePostModal({ onClose, onCreated }: CreatePostModalProps) {
  const currentUser = useAuthStore((s) => s.user);
  const createPost = useCreatePost();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ← Même règle que côté backend (StorePostRequest) : il faut un texte
  // OU au moins une photo, pas les deux vides.
  const canSubmit =
    (content.trim().length > 0 || photos.length > 0) &&
    !uploading &&
    !createPost.isPending;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_PHOTOS} photos par post.`);
      return;
    }

    const toAdd = files.slice(0, remaining).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...toAdd]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);

    try {
      // ← On upload d'abord toutes les photos en attente (récupère leurs
      // URLs publiques via /upload, dossier "posts"), puis on crée le
      // post avec ces URLs — même mécanisme que pour une annonce.
      setUploading(true);
      const uploadedUrls = await Promise.all(
        photos.map((p) => uploadApi.upload(p.file, "posts").then((r) => r.url)),
      );
      setUploading(false);

      await createPost.mutateAsync({
        content: content.trim() || undefined,
        photos: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      });

      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      onCreated?.();
      onClose();
    } catch {
      setUploading(false);
      setError("Échec de la publication. Réessayez.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          className="relative z-10 w-full sm:max-w-lg glass-card rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 mx-4 max-h-[90vh] overflow-y-auto"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="font-bold text-[var(--pc-text-primary)]"
              style={{ fontSize: "16px" }}
            >
              Publier un post
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--pc-surface-alt)] transition-colors"
            >
              <X size={16} className="text-[var(--pc-text-secondary)]" />
            </button>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--pc-primary)] to-emerald-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {currentUser?.name?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </div>
            <textarea
              value={content}
              onChange={(e) =>
                setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))
              }
              placeholder="Quoi de neuf ? Partagez une photo, une question, une astuce..."
              rows={4}
              autoFocus
              className="flex-1 bg-transparent text-[var(--pc-text-primary)] placeholder-[var(--pc-text-secondary)] focus:outline-none resize-none"
              style={{ fontSize: "14px" }}
            />
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-xl overflow-hidden"
                >
                  <img
                    src={photo.previewUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mb-4 bg-red-500/10 rounded-xl px-3 py-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[var(--pc-border)]/40 pt-4">
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= MAX_PHOTOS}
                className="flex items-center gap-1.5 text-[var(--pc-primary)] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontSize: "13px" }}
              >
                <ImageIcon size={16} /> Ajouter photo ({photos.length}/
                {MAX_PHOTOS})
              </button>
            </div>

            <span
              className="text-[var(--pc-text-secondary)]"
              style={{ fontSize: "11px" }}
            >
              {content.length}/{MAX_CONTENT_LENGTH}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full mt-4 py-3 rounded-xl font-bold text-white disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, var(--pc-primary), #2aad85)",
              fontSize: "14px",
            }}
          >
            {uploading || createPost.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Publier"
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
