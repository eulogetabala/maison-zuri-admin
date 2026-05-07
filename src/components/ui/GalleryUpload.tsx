'use client';

import { useState } from 'react';
import { UploadCloud, Loader2, Image as ImageIcon, X, Plus } from 'lucide-react';
import Image from 'next/image';

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
}

export default function GalleryUpload({ value = [], onChange, folder = 'products' }: GalleryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert(`Config manquante : CloudName=${cloudName}, Preset=${uploadPreset}`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      const newUrls = [...value];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        
        // On envoie le STRICT MINIMUM pour un upload non signé
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        // Note: On retire 'folder' pour tester si c'est lui qui cause le besoin d'API Key

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Erreur Cloudinary');
        }

        newUrls.push(data.secure_url);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      onChange(newUrls);
      setIsUploading(false);
    } catch (err: any) {
      console.error('Upload detail:', err);
      alert(`Détail Erreur : ${err.message}\nPreset utilisé : ${uploadPreset}\nCloudName : ${cloudName}`);
      setIsUploading(false);
    }
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('/')) return `http://localhost:3000${url}`;
    return url;
  };

  const removeImage = (index: number) => {
    const newUrls = [...value];
    newUrls.splice(index, 1);
    onChange(newUrls);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 group bg-gray-50 shadow-sm">
            <Image src={getImageUrl(url)} alt={`Gallery ${index}`} fill unoptimized className="object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button type="button" onClick={() => removeImage(index)} className="bg-white text-red-500 rounded-full p-1.5 hover:bg-gray-100 transition-colors shadow-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-luxury-gold text-white text-[8px] uppercase font-bold px-2 py-1 rounded-sm shadow-sm">Vignette</div>
            )}
          </div>
        ))}

        <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-luxury-gold transition-colors bg-gray-50 flex flex-col items-center justify-center cursor-pointer group">
          <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" disabled={isUploading} />
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-6 h-6 animate-spin text-luxury-gold" />
              <span className="text-[8px] mt-2 font-bold text-luxury-gold">{uploadProgress}%</span>
            </div>
          ) : (
            <>
              <div className="bg-white p-2 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-luxury-gold transition-colors" />
              </div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400">Ajouter</span>
            </>
          )}
        </label>
      </div>
    </div>
  );
}
