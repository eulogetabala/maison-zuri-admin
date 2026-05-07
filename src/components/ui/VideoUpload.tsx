'use client';

import { useState } from 'react';
import { Upload, Loader2, Video, X } from 'lucide-react';

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function VideoUpload({ value, onChange }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset || '');
      formData.append('resource_type', 'video'); // Important pour Cloudinary

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        { method: 'POST', body: formData }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Erreur');

      onChange(data.secure_url);
      setIsUploading(false);
    } catch (err: any) {
      alert(`Erreur Vidéo : ${err.message}`);
      setIsUploading(false);
    }
  };

  if (value) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black group">
        <video src={value} controls className="w-full h-full object-contain" />
        <button 
          onClick={() => onChange('')}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-lg border-2 border-dashed border-gray-200 hover:border-luxury-gold transition-colors bg-gray-50 flex flex-col items-center justify-center">
      <input 
        type="file" 
        accept="video/*" 
        onChange={handleUpload} 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />
      {isUploading ? (
        <Loader2 className="animate-spin text-luxury-gold" />
      ) : (
        <div className="text-center">
          <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Vidéo du produit (MP4)</p>
        </div>
      )}
    </div>
  );
}
