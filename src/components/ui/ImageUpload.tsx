'use client';

import { useState } from 'react';
import { UploadCloud, Loader2, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export default function ImageUpload({ value, onChange, folder = 'products' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert('Cloudinary non configuré.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      onChange(data.secure_url);
      setIsUploading(false);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
      setIsUploading(false);
    }
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('/')) return `http://localhost:3000${url}`;
    return url;
  };

  if (value) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-100 group">
        <Image src={getImageUrl(value)} alt="Aperçu" fill unoptimized className="object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button type="button" onClick={() => onChange('')} className="bg-white text-red-500 rounded-full p-2">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-lg border-2 border-dashed border-gray-200 hover:border-luxury-gold transition-colors bg-gray-50 flex flex-col items-center justify-center overflow-hidden">
      <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading} />
      {isUploading ? (
        <Loader2 className="w-8 h-8 animate-spin text-luxury-gold" />
      ) : (
        <div className="flex flex-col items-center text-gray-400">
          <UploadCloud className="w-10 h-10 mb-2" />
          <span className="text-[10px] uppercase font-bold tracking-widest">Image principale</span>
        </div>
      )}
    </div>
  );
}
