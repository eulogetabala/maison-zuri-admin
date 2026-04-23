'use client';

import { useState } from 'react';
import AdminLayout from "@/components/layout/AdminLayout";
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle,
  Loader2,
  Calendar,
  User,
  MapPin,
  X
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ORDERS_QUERY = gql`
  query GetOrders {
    orders {
      id
      customerName
      email
      phone
      address
      city
      total
      status
      createdAt
      items {
        productId
        name
        quantity
        price
      }
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const statusMap: Record<string, { label: string, color: string, icon: any }> = {
  'PENDING': { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: Clock },
  'IN_TRANSIT': { label: 'En cours de livraison', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  'SHIPPED': { label: 'Expédiée', color: 'bg-blue-100 text-blue-700', icon: Truck },
  'DELIVERED': { label: 'Livrée', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  'CANCELLED': { label: 'Annulée', color: 'bg-rose-100 text-rose-700', icon: XCircle },
};

export default function OrdersPage() {
  const { data, loading, refetch } = useQuery(ORDERS_QUERY);
  const [updateStatus, { loading: isUpdating }] = useMutation(UPDATE_ORDER_STATUS);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filteredOrders = data?.orders?.filter((o: any) => 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    await updateStatus({ variables: { id, status: newStatus } });
    refetch();
    if (selectedOrder?.id === id) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-gray-50">
          <div>
            <h1 className="text-4xl font-serif mb-2">Commandes Client</h1>
            <p className="text-luxury-black/40 text-[10px] uppercase tracking-[0.3em] font-bold">
              Suivez et gérez l&apos;état des livraisons en temps réel
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-black/30 group-focus-within:text-luxury-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Nom du client ou N° de commande..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-luxury-gray/50 border-none w-full py-3 pl-12 text-xs font-medium focus:ring-1 focus:ring-luxury-gold transition-all outline-none rounded-lg"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-luxury-gray/30 border-b border-gray-100">
              <tr>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-luxury-black/60">Commande</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-luxury-black/60">Client</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-luxury-black/60">Date</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-luxury-black/60">Statut</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-luxury-black/60">Total</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-luxury-black/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-luxury-gold" />
                  </td>
                </tr>
              ) : filteredOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-luxury-gray/10 transition-colors">
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold font-mono text-luxury-gold">#{order.id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-xs font-bold text-luxury-black">{order.customerName}</p>
                      <p className="text-[10px] text-luxury-black/40 mt-0.5">{order.city}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs text-luxury-black font-medium">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-black flex items-center gap-2 w-fit",
                      statusMap[order.status]?.color || 'bg-gray-100 text-gray-500'
                    )}>
                      {statusMap[order.status]?.label || order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-luxury-black">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-3 hover:bg-white hover:text-luxury-gold transition-all hover:shadow-md rounded-lg"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-luxury-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, x: 50 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.95, opacity: 0, x: 50 }}
              className="relative bg-white max-w-4xl w-full h-[85vh] overflow-hidden flex shadow-2xl rounded-lg"
            >
              {/* Left Side: Order Info */}
              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h2 className="text-3xl font-serif mb-2">Commande #{selectedOrder.id.slice(-6).toUpperCase()}</h2>
                    <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-luxury-black/40">
                      <Calendar className="w-3 h-3" /> {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-luxury-gray rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-16">
                  <div className="space-y-6">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-luxury-gold border-b border-gray-50 pb-2">Client</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-luxury-black/30" />
                        <span className="text-xs font-bold">{selectedOrder.customerName}</span>
                      </div>
                      <p className="text-xs text-luxury-black/60 pl-7">{selectedOrder.email}</p>
                      <p className="text-xs font-bold text-luxury-gold pl-7">{selectedOrder.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-luxury-gold border-b border-gray-50 pb-2">Livraison</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 text-luxury-black/30">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-luxury-black">{selectedOrder.address}</p>
                          <p className="text-xs uppercase tracking-widest mt-1">{selectedOrder.city}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-luxury-gold border-b border-gray-50 pb-2">Articles</h3>
                  <div className="space-y-8">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.productId} className="flex justify-between items-center bg-luxury-gray/30 p-4 rounded-lg">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white rounded border border-gray-100 flex items-center justify-center font-black text-luxury-gold text-xs">
                            {item.quantity}x
                          </div>
                          <div>
                            <p className="text-sm font-bold">{item.name}</p>
                            <p className="text-[10px] uppercase tracking-widest text-luxury-black/40">Ref: {item.productId.slice(-6)}</p>
                          </div>
                        </div>
                        <p className="text-sm font-black">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-8 border-t border-gray-100 flex justify-between items-end">
                    <p className="text-[10px] uppercase tracking-[0.4em] font-black">Total de la commande</p>
                    <p className="text-4xl font-serif text-luxury-gold">{formatPrice(selectedOrder.total)}</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Status Management */}
              <div className="w-80 bg-luxury-gray/50 border-l border-gray-100 p-12 flex flex-col justify-between">
                <div className="space-y-10">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-luxury-black">Gestion du Statut</h3>
                  <div className="space-y-4">
                    {Object.entries(statusMap).map(([key, value]) => (
                      <button 
                        key={key}
                        onClick={() => handleStatusUpdate(selectedOrder.id, key)}
                        disabled={isUpdating}
                        className={cn(
                          "w-full p-6 rounded-lg text-left transition-all duration-500 border flex items-center justify-between group",
                          selectedOrder.status === key 
                            ? "bg-white border-luxury-gold shadow-lg" 
                            : "bg-transparent border-transparent hover:bg-white/60 hover:border-gray-200"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <value.icon className={cn(
                            "w-5 h-5",
                            selectedOrder.status === key ? "text-luxury-gold" : "text-luxury-black/30"
                          )} />
                          <span className={cn(
                            "text-[10px] uppercase tracking-widest font-black",
                            selectedOrder.status === key ? "text-luxury-black" : "text-luxury-black/40"
                          )}>
                            {value.label}
                          </span>
                        </div>
                        {selectedOrder.status === key && (
                          <div className="w-2 h-2 rounded-full bg-luxury-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-white rounded-lg shadow-sm space-y-4">
                  <p className="text-[9px] uppercase tracking-widest leading-relaxed text-luxury-black/50 italic">
                    Toute modification de statut peut être suivie par le client. Assurez-vous des informations avant de valider.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
