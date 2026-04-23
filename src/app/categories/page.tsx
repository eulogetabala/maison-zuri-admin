'use client';

import { useState } from 'react';
import AdminLayout from "@/components/layout/AdminLayout";
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  Loader2,
  ListTree,
  FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '@/components/ui/ImageUpload';

const CATEGORIES_QUERY = gql`
  query GetCategories {
    categories {
      id
      name
      description
      image
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
      name
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      description
      image
    }
  }
`;

export default function CategoriesPage() {
  const { data, loading, refetch } = useQuery(CATEGORIES_QUERY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);
  const [createCategory, { loading: isCreating }] = useMutation(CREATE_CATEGORY);
  const [updateCategory, { loading: isUpdating }] = useMutation(UPDATE_CATEGORY);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState = {
    name: '',
    description: '',
    image: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  const filteredCategories = data?.categories?.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette catégorie ? Cela n\'affectera pas les produits déjà liés.')) {
      await deleteCategory({ variables: { id } });
      refetch();
    }
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategory({ variables: { id: editingId, input: formData } });
      } else {
        await createCategory({ variables: { input: formData } });
      }
      setIsModalOpen(false);
      setFormData(initialFormState);
      refetch();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde');
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-gray-50">
          <div>
            <h1 className="text-4xl font-serif mb-2">Catégories</h1>
            <p className="text-luxury-black/40 text-[10px] uppercase tracking-[0.3em] font-bold">
              Organisez vos collections d&apos;articles
            </p>
          </div>
          
          <button 
            onClick={handleOpenNew}
            className="bg-luxury-black text-white px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-luxury-gold transition-all duration-500 flex items-center gap-3 shadow-xl"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Catégorie
          </button>
        </div>

        {/* Search */}
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-black/30 group-focus-within:text-luxury-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher une catégorie..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-luxury-gray/50 border-none w-full py-3 pl-12 text-xs font-medium focus:ring-1 focus:ring-luxury-gold transition-all outline-none rounded-lg"
          />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-luxury-gold mb-4" />
            </div>
          ) : filteredCategories.map((cat: any, i: number) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={cat.id}
              className="bg-white border border-gray-100 p-8 rounded-lg hover:shadow-xl transition-all group flex flex-col justify-between min-h-[250px]"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-luxury-gray rounded-lg flex items-center justify-center text-luxury-black group-hover:border-luxury-gold transition-colors relative overflow-hidden border border-transparent">
                    {cat.image ? (
                      <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                    ) : (
                      <FolderOpen className="w-6 h-6 group-hover:text-luxury-gold transition-colors" />
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(cat)}
                      className="p-2 hover:text-luxury-gold transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-serif mb-2">{cat.name}</h3>
                <p className="text-xs text-luxury-black/50 leading-relaxed line-clamp-3 italic">
                  {cat.description || 'Aucune description fournie.'}
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest font-black text-luxury-black/40">ID: {cat.id}</span>
                <ListTree className="w-4 h-4 text-luxury-gold/30" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-luxury-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white max-w-lg w-full p-10 md:p-12 shadow-2xl rounded-lg"
            >
              <h2 className="text-3xl font-serif mb-10">
                {editingId ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-luxury-black/60">Image de la Catégorie</label>
                  <ImageUpload 
                    value={formData.image} 
                    onChange={(url) => setFormData({...formData, image: url})} 
                    folder="categories"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-luxury-black/60">Nom</label>
                  <input 
                    required
                    type="text"
                    className="w-full border-b border-gray-200 py-3 outline-none focus:border-luxury-gold transition-colors text-sm font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-luxury-black/60">Description</label>
                  <textarea 
                    className="w-full border-b border-gray-200 py-3 outline-none focus:border-luxury-gold transition-colors text-sm font-medium resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="w-full bg-luxury-black text-white py-6 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-luxury-gold transition-all duration-500 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                >
                  {(isCreating || isUpdating) ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? 'Mettre à jour' : 'Créer la catégorie')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
