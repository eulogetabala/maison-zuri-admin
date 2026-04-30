'use client';

import { useState } from 'react';
import { UploadCloud, Loader2, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export default function ImageUpload({ value, onChange, folder = 'uploads' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image/')) {
      alert('Veuillez sélectionner une image valide.');
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    if (!cloudName || !uploadPreset) {
      alert('Cloudinary non configuré. Vérifiez vos variables d\'environnement.');
      return;
    }

    try {
      setIsUploading(true);
      setProgress(10); // Simulation de début d'upload

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);
      if (apiKey) {
        formData.append('api_key', apiKey);
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      setProgress(100);
      onChange(data.secure_url);
      setIsUploading(false);
      
      // Reset progress après un court délai
      setTimeout(() => setProgress(0), 1000);
    } catch (err: any) {
      console.error('Erreur Cloudinary Upload:', err);
      alert(`Erreur lors du téléchargement : ${err.message}`);
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  if (value) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-100 group">
        <Image src={value} alt="Aperçu" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            type="button" 
            onClick={handleRemove}
            className="bg-white text-red-500 rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-lg border-2 border-dashed border-gray-200 hover:border-luxury-gold transition-colors bg-gray-50 flex flex-col items-center justify-center overflow-hidden">
      <input 
        type="file" 
        accept="image/*"
        onChange={handleUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        disabled={isUploading}
      />
      {isUploading ? (
        <div className="flex flex-col items-center text-luxury-gold">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-[10px] uppercase font-bold tracking-widest">{Math.round(progress)}%</span>
        </div>
      ) : (
        <div className="flex flex-col items-center text-gray-400">
          <UploadCloud className="w-10 h-10 mb-3" />
          <span className="text-xs font-medium">Cliquez pour téléverser une image</span>
          <span className="text-[10px] uppercase tracking-widest mt-1 opacity-60">PNG, JPG ou WEBP (Max 5MB)</span>
        </div>
      )}
    </div>
  );
}
