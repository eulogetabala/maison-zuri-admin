'use client';

import { useState } from 'react';
import AdminLayout from "@/components/layout/AdminLayout";
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  ExternalLink,
  X,
  Image as ImageIcon,
  Loader2,
  UploadCloud
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '@/components/ui/ImageUpload';
import ZuriGallery from '@/components/ui/ZuriGallery';
import VideoUpload from '@/components/ui/VideoUpload';

const PRODUCTS_QUERY = gql`
  query GetProducts {
    products {
      id
      name
      price
      description
      category
      image
      discountPrice
      gallery
      video
    }
    categories {
      id
      name
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      name
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
    }
  }
`;

export default function ProduitsPage() {
  const { data: rawData, loading, refetch } = useQuery(PRODUCTS_QUERY);
  const data = rawData as any;
  
  console.log('ProduitsPage Data:', data);

  const [deleteProduct, { loading: isDeleting }] = useMutation(DELETE_PRODUCT);
  const [createProduct, { loading: isCreating }] = useMutation(CREATE_PRODUCT);
  const [updateProduct, { loading: isUpdating }] = useMutation(UPDATE_PRODUCT);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: '',
    discountPrice: '',
    gallery: [] as string[],
    video: '',
  });


  const filteredProducts = data?.products?.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      await deleteProduct({ variables: { id: productToDelete.id } });
      setProductToDelete(null);
      refetch();
    }
  };

  const openEditModal = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || '',
      category: product.category || '',
      image: product.image || '',
      discountPrice: product.discountPrice ? product.discountPrice.toString() : '',
      gallery: product.gallery || [],
      video: product.video || '',
    });
    setIsModalOpen(true);
  };
  
  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', description: '', category: '', image: '', discountPrice: '', gallery: [], video: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const inputVariables = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        image: formData.image,
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        gallery: formData.gallery,
        video: formData.video,
      };

      if (editingId) {
        await updateProduct({
          variables: { id: editingId, input: inputVariables }
        });
      } else {
        await createProduct({
          variables: { input: inputVariables }
        });
      }
      
      setIsModalOpen(false);
      setFormData({ name: '', price: '', description: '', category: '', image: '', discountPrice: '', gallery: [], video: '' });
      setEditingId(null);
      refetch();
    } catch (err) {
      alert('Erreur lors de la validation du produit');
    }
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    // Si c'est un lien relatif (ex: /29.png), on va chercher l'image sur le serveur du front (localhost:3000)
    // car le dossier public de l'admin ne contient pas les images de base.
    if (url.startsWith('/')) {
      return `http://localhost:3000${url}`;
    }
    return url;
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-gray-50">
          <div>
            <h1 className="text-4xl font-serif mb-2">Gestion des Produits (V2)</h1>
            <p className="text-luxury-black/40 text-[10px] uppercase tracking-[0.3em] font-bold">
              Consultez et modifiez votre catalogue d&apos;articles
            </p>
          </div>
          
          <button 
            onClick={openCreateModal}
            className="bg-luxury-black text-white px-8 py-4 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-luxury-gold transition-all duration-500 flex items-center gap-3 shadow-xl"
          >
            <Plus className="w-4 h-4" />
            Nouveau Produit
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-luxury-gray/50 p-4 rounded-lg">
          <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-black/30 group-focus-within:text-luxury-gold transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border-none w-full py-3 pl-12 text-xs font-medium focus:ring-1 focus:ring-luxury-gold transition-all outline-none rounded-lg"
            />
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-[10px] uppercase tracking-widest font-bold border border-gray-100 hover:border-luxury-gold transition-all rounded-lg">
              <Filter className="w-3 h-3 text-luxury-gold" /> Filtrer
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-luxury-gray/30 border-b border-gray-100">
              <tr>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-luxury-black/60">Produit</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-luxury-black/60">Catégorie</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-luxury-black/60">Prix</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-luxury-black/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                   <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-luxury-gold mb-4" />
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-luxury-black/40">Chargement du catalogue...</p>
                   </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-luxury-black/40 text-[10px] uppercase tracking-[0.3em] font-bold">
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : filteredProducts.map((product: any) => (
                <tr key={product.id} className="hover:bg-luxury-gray/10 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-luxury-gray rounded flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                        {product.image ? (
                          <img src={getImageUrl(product.image) || ''} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-luxury-black/10" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-luxury-black">{product.name}</p>
                        <p className="text-[10px] text-luxury-black/40 uppercase tracking-widest mt-1">ID: {product.id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-luxury-gray text-[9px] uppercase tracking-widest font-black text-luxury-black rounded-full">
                      {product.category || 'Non classé'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className={cn("text-sm font-bold", product.discountPrice ? "text-red-500" : "text-luxury-gold")}>
                        {formatPrice(product.discountPrice || product.price)}
                      </span>
                      {product.discountPrice && (
                        <span className="text-[10px] text-luxury-black/30 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="p-2 hover:bg-white hover:text-luxury-gold transition-all hover:shadow-sm rounded-lg" 
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setProductToDelete(product)}
                        className="p-2 hover:bg-white hover:text-red-500 transition-all hover:shadow-sm rounded-lg" title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white hover:text-luxury-black transition-all hover:shadow-sm rounded-lg" title="Voir sur le site">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
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
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl rounded-lg overflow-hidden"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-luxury-gray rounded-full transition-colors z-50 bg-white/80 backdrop-blur-sm shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto p-10 md:p-12">
                <h2 className="text-3xl font-serif mb-10 pb-4 border-b border-gray-50">
                  {editingId ? 'Modifier le Produit' : 'Nouveau Produit'}
                </h2>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-luxury-black/60">Nom de l&apos;article</label>
                    <input 
                      required
                      type="text"
                      className="w-full border-b border-gray-200 py-3 outline-none focus:border-luxury-gold transition-colors text-sm font-medium"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-luxury-black/60">Prix de base (FCFA)</label>
                    <input 
                      required
                      type="number"
                      className="w-full border-b border-gray-200 py-3 outline-none focus:border-luxury-gold transition-colors text-sm font-medium"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-red-500/60">Prix Promo (Optionnel)</label>
                    <input 
                      type="number"
                      className="w-full border-b border-gray-200 py-3 outline-none focus:border-red-500 transition-colors text-sm font-medium"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({...formData, discountPrice: e.target.value})}
                      placeholder="Laisser vide"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-luxury-black/60">Catégorie</label>
                  <select 
                    required
                    className="w-full border-b border-gray-200 py-3 outline-none focus:border-luxury-gold transition-colors text-sm font-medium bg-transparent"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {data?.categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-luxury-black/60">Image du produit</label>
                  <ImageUpload 
                    value={formData.image}
                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                    folder="products"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-luxury-black/60">Galerie photos (Plusieurs images)</label>
                  <ZuriGallery 
                    value={formData.gallery}
                    onChange={(urls) => setFormData(prev => ({ ...prev, gallery: urls }))}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-luxury-black/60">Vidéo de présentation (Optionnel)</label>
                  <VideoUpload 
                    value={formData.video}
                    onChange={(url) => setFormData(prev => ({ ...prev, video: url }))}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-luxury-black/60">Description courte</label>
                  <textarea 
                    rows={3}
                    className="w-full border border-gray-100 p-4 outline-none focus:border-luxury-gold transition-colors text-sm font-medium bg-luxury-gray/30 rounded-lg resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="w-full bg-luxury-black text-white py-6 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-luxury-gold transition-all duration-500 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {(isCreating || isUpdating) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>{editingId ? "Valider les modifications" : "Créer l'article"}</>
                  )}
                </button>
              </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white max-w-sm w-full p-8 shadow-2xl rounded-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif mb-2">Êtes-vous sûr ?</h3>
              <p className="text-sm text-luxury-black/60 mb-8 leading-relaxed">
                Voulez-vous vraiment supprimer le produit <strong className="text-luxury-black font-bold">"{productToDelete.name}"</strong> ? Cette action est définitive.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setProductToDelete(null)}
                  disabled={isDeleting}
                  className="py-3 px-4 bg-luxury-gray/30 hover:bg-luxury-gray/50 text-[10px] uppercase tracking-widest font-bold text-luxury-black rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="py-3 px-4 bg-red-500 hover:bg-red-600 text-[10px] uppercase tracking-widest font-bold text-white rounded-lg transition-colors flex justify-center items-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Supprimer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
