'use client';

import { useState } from 'react';
import AdminLayout from "@/components/layout/AdminLayout";
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  ArrowUpRight,
  Search,
  Bell,
  Globe,
  CreditCard
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const DASHBOARD_QUERY = gql`
  query GetDashboardData {
    adminStats {
      totalRevenue
      ordersCount
      productsCount
      averageOrderValue
      salesChart {
        date
        amount
      }
      countryStats {
        country
        count
        revenue
        code
      }
    }
    orders {
      id
      customerName
      total
      status
      createdAt
    }
  }
`;

export default function DashboardPage() {
  const { data: rawData, loading } = useQuery(DASHBOARD_QUERY);
  const data = rawData as any;
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const stats = data?.adminStats;
  const recentOrders = data?.orders?.slice(0, 5) || [];

  const handleChartClick = (data: any) => {
    if (data && data.activeLabel) {
      setSelectedMonth(data.activeLabel === selectedMonth ? null : data.activeLabel);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 md:p-12 space-y-12 bg-white">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 border-b border-gray-50">
          <div>
            <h1 className="text-4xl font-serif mb-2">Tableau de bord</h1>
            <p className="text-luxury-black/40 text-[10px] uppercase tracking-[0.3em] font-bold">
              Analytique & Performance Maison Zuri
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-black/30 group-focus-within:text-luxury-gold transition-colors" />
              <input 
                type="text" 
                placeholder="Rechercher une commande..." 
                className="bg-luxury-gray border-none w-72 py-3 pl-12 text-xs font-medium focus:ring-1 focus:ring-luxury-gold transition-all outline-none rounded-lg"
              />
            </div>
            <button className="p-3 bg-luxury-gray hover:bg-luxury-gold/10 text-luxury-black/60 hover:text-luxury-gold transition-all rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-luxury-gold rounded-full border-2 border-white" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { 
              name: 'Revenu Total', 
              value: formatPrice(stats?.totalRevenue || 0), 
              icon: TrendingUp, 
              change: '+12.5%', 
              color: 'text-luxury-gold' 
            },
            { 
              name: 'Commandes', 
              value: stats?.ordersCount || 0, 
              icon: ShoppingBag, 
              change: '+8 aujourd\'hui', 
              color: 'text-luxury-black' 
            },
            { 
              name: 'Panier Moyen', 
              value: formatPrice(stats?.averageOrderValue || 0), 
              icon: CreditCard, 
              change: '+5.2%', 
              color: 'text-luxury-black' 
            },
            { 
              name: 'Produits', 
              value: stats?.productsCount || 0, 
              icon: Package, 
              change: 'En stock', 
              color: 'text-luxury-black' 
            }
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.name} 
              className="p-6 border border-gray-100 hover:border-luxury-gold/30 hover:shadow-lg transition-all group rounded-xl bg-white"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-luxury-gray group-hover:bg-luxury-gold group-hover:text-white transition-colors rounded-lg">
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">{stat.change}</span>
              </div>
              <p className="text-luxury-black/40 text-[9px] uppercase tracking-widest font-bold mb-1">{stat.name}</p>
              <h3 className={stat.color + " text-xl font-serif"}>{loading ? '...' : stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Main Section: Chart & Geography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sales Chart */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.3em] font-black text-luxury-black">
                    Performance des Ventes {selectedMonth && `- ${selectedMonth}`}
                  </h3>
                  {selectedMonth && (
                    <button 
                      onClick={() => setSelectedMonth(null)}
                      className="text-[8px] text-luxury-gold uppercase font-bold mt-1 hover:underline"
                    >
                      Réinitialiser le filtre
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-luxury-black/40">
                    <div className="w-2 h-2 bg-luxury-gold rounded-full" />
                    Chiffre d&apos;affaires
                  </div>
                </div>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={stats?.salesChart || []}
                    onClick={handleChartClick}
                  >
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fill: '#999', fontWeight: 600}} 
                      dy={16}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fill: '#999', fontWeight: 600}}
                      tickFormatter={(v) => v >= 1000000 ? `${v/1000000}M` : v >= 1000 ? `${v/1000}k` : v}
                    />
                    <Tooltip 
                      cursor={{ stroke: '#D4AF37', strokeWidth: 1, strokeDasharray: '4 4' }}
                      formatter={(value: any) => [formatPrice(value), "Ventes"]}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                        fontSize: '11px',
                        padding: '12px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#D4AF37" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorAmount)"
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#D4AF37' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Selected Month Detail (Animated) */}
            <AnimatePresence>
              {selectedMonth && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-6 bg-luxury-black text-white rounded-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest opacity-60">Focus sur</p>
                      <h4 className="text-xl font-serif">{selectedMonth}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-widest opacity-60">Objectif atteint</p>
                      <p className="text-xl font-serif text-luxury-gold">94%</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Geography Widget */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-3 mb-10 pb-4 border-b border-gray-50">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-[11px] uppercase tracking-[0.3em] font-black text-luxury-black">
                  Top Marchés
                </h3>
              </div>

              <div className="flex-1 space-y-6">
                {stats?.countryStats?.map((stat: any, i: number) => (
                  <div key={stat.country} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{stat.code === 'CI' ? '🇨🇮' : stat.code === 'SN' ? '🇸🇳' : stat.code === 'FR' ? '🇫🇷' : '🌍'}</span>
                        <span className="text-xs font-bold text-luxury-black">{stat.country}</span>
                      </div>
                      <span className="text-xs font-serif text-luxury-gold">{formatPrice(stat.revenue)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(stat.revenue / stats.totalRevenue) * 100}%` }}
                        className="h-full bg-luxury-gold/60 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-[8px] uppercase font-bold text-luxury-black/30 tracking-widest">
                      <span>{stat.count} commandes</span>
                      <span>{Math.round((stat.revenue / stats.totalRevenue) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50">
                <p className="text-[9px] text-luxury-black/40 italic">
                  * Analyse basée sur les indicatifs téléphoniques des clients.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Orders */}
        <div className="p-8 border border-gray-100 rounded-2xl bg-white shadow-sm">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
            <h3 className="text-[11px] uppercase tracking-[0.3em] font-black text-luxury-black">
              Dernières Activités
            </h3>
            <button className="text-[9px] uppercase tracking-widest text-luxury-gold font-bold hover:underline">
              Voir tout l&apos;historique
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 hover:bg-luxury-gray/30 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-luxury-black text-white flex items-center justify-center font-serif text-sm">
                    {order.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-luxury-black">{order.customerName}</p>
                    <p className="text-[9px] text-luxury-black/40 uppercase tracking-widest">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-luxury-gold">{formatPrice(order.total)}</p>
                  <span className={`text-[8px] uppercase tracking-widest font-black ${
                    order.status === 'COMPLETED' ? 'text-green-500' : 'text-orange-500'
                  }`}>
                    {order.status === 'PENDING' ? 'En attente' : 
                     order.status === 'COMPLETED' ? 'Terminée' : 
                     order.status === 'CANCELLED' ? 'Annulée' : order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
