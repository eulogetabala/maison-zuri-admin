'use client';

import { useState } from 'react';
import { Loader2, X, Plus } from 'lucide-react';
import Image from 'next/image';

interface GalleryProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export default function ZuriGallery({ value = [], onChange }: GalleryProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert('Erreur : Configuration Cloudinary manquante dans le fichier .env.local');
      return;
    }

    try {
      setIsUploading(true);
      const newUrls = [...value];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || 'Erreur lors de l\'envoi');
        }

        newUrls.push(result.secure_url);
      }

      onChange(newUrls);
      setIsUploading(false);
    } catch (err: any) {
      alert(`Erreur d'envoi : ${err.message}`);
      setIsUploading(false);
    }
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('/')) return `http://localhost:3000${url}`;
    return url;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 border p-4 rounded-lg bg-gray-50/50">
      {value.map((url, index) => (
        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 shadow-sm group">
          <Image src={getImageUrl(url)} alt="gallery-img" fill unoptimized className="object-cover transition-transform group-hover:scale-110" />
          <button 
            type="button"
            onClick={() => {
              const n = [...value]; n.splice(index, 1); onChange(n);
            }} 
            className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow-md hover:bg-red-50 transition-colors"
          >
            <X size={12}/>
          </button>
          {index === 0 && (
            <div className="absolute bottom-1 left-1 bg-luxury-gold text-white text-[6px] uppercase font-bold px-1 rounded-sm">Vignette</div>
          )}
        </div>
      ))}
      <label className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-luxury-gold hover:bg-white transition-all group">
        <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" disabled={isUploading} />
        {isUploading ? (
          <Loader2 className="animate-spin text-luxury-gold" />
        ) : (
          <>
            <Plus className="text-gray-400 group-hover:text-luxury-gold" />
            <span className="text-[8px] uppercase font-bold tracking-widest text-gray-400 mt-1">Ajouter</span>
          </>
        )}
      </label>
    </div>
  );
}
