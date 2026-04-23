'use client';

import AdminLayout from "@/components/layout/AdminLayout";
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Users, 
  ArrowUpRight,
  MoreVertical,
  Search,
  Bell
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
import { motion } from 'framer-motion';

const DASHBOARD_QUERY = gql`
  query GetDashboardData {
    adminStats {
      totalRevenue
      ordersCount
      productsCount
      salesChart {
        date
        amount
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
  const { data: rawData, loading, error } = useQuery(DASHBOARD_QUERY);
  const data = rawData as any;


  const stats = data?.adminStats;
  const recentOrders = data?.orders?.slice(0, 5) || [];

  return (
    <AdminLayout>
      <div className="p-8 md:p-12 space-y-12 bg-white">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 border-b border-gray-50">
          <div>
            <h1 className="text-4xl font-serif mb-2">Tableau de bord</h1>
            <p className="text-luxury-black/40 text-[10px] uppercase tracking-[0.3em] font-bold">
              Bienvenue dans votre espace de gestion Maison Zuri
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              change: '+8 hoy', 
              color: 'text-luxury-black' 
            },
            { 
              name: 'Produits en Stock', 
              value: stats?.productsCount || 0, 
              icon: Package, 
              change: '2 épuisés', 
              color: 'text-luxury-black' 
            }
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.name} 
              className="p-8 border border-gray-100 hover:border-luxury-gold/30 hover:shadow-xl transition-all group rounded-lg"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-luxury-gray group-hover:bg-luxury-gold group-hover:text-white transition-colors rounded-lg">
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{stat.change}</span>
              </div>
              <p className="text-luxury-black/40 text-[10px] uppercase tracking-widest font-bold mb-1">{stat.name}</p>
              <h3 className={stat.color + " text-3xl font-serif"}>{loading ? '...' : stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Chart & Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
          {/* Main Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-8 p-8 border border-gray-100 rounded-lg"
          >
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-[11px] uppercase tracking-[0.3em] font-black text-luxury-black">
                Performance des Ventes
              </h3>
              <select className="bg-transparent border-none text-[10px] uppercase tracking-widest font-bold text-luxury-gold focus:ring-0 cursor-pointer">
                <option>6 derniers mois</option>
                <option>30 derniers jours</option>
              </select>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.salesChart || []}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#666', fontWeight: 600}} 
                    dy={16}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#666', fontWeight: 600}}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#D4AF37" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Orders */}
          <div className="lg:col-span-4 p-8 border border-gray-100 rounded-lg flex flex-col">
            <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-50">
              <h3 className="text-[11px] uppercase tracking-[0.3em] font-black text-luxury-black">
                Dernières Commandes
              </h3>
              <button className="text-[9px] uppercase tracking-widest text-luxury-gold font-bold hover:text-luxury-black transition-colors">
                Tout voir
              </button>
            </div>

            <div className="flex-1 space-y-8">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-luxury-gray animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-luxury-gray flex items-center justify-center font-bold text-[10px] group-hover:bg-luxury-gold group-hover:text-white transition-all">
                      {order.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-luxury-black line-clamp-1">{order.customerName}</p>
                      <p className="text-[10px] text-luxury-black/40 uppercase tracking-widest mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-luxury-gold">{formatPrice(order.total)}</p>
                    <span className="text-[8px] uppercase tracking-widest font-black text-luxury-black/30">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-10 py-4 bg-luxury-black text-white text-[9px] uppercase tracking-[0.3em] font-black hover:bg-luxury-gold transition-all rounded-lg flex items-center justify-center gap-2">
              Gérer les commandes
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
