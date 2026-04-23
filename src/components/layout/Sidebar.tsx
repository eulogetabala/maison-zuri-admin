'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ListTree, 
  ShoppingBag, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const menuItems = [
  { name: 'Tableau de bord', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Produits', icon: Package, href: '/produits' },
  { name: 'Catégories', icon: ListTree, href: '/categories' },
  { name: 'Commandes', icon: ShoppingBag, href: '/orders' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('admin_token');
    router.push('/login');
  };

  return (
    <div className="w-72 h-screen bg-luxury-black text-white flex flex-col sticky top-0 border-r border-white/5">
      {/* Logo */}
      <div className="p-8 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-0 transition-opacity hover:opacity-80">
          <div className="bg-white rounded-lg px-3 py-2 inline-flex items-center">
            <Image
              src="/logo-zuri.jpeg"
              alt="Maison Zuri"
              width={140}
              height={50}
              className="object-contain h-10 w-auto"
              priority
            />
          </div>
        </Link>
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mt-3 font-bold pl-1">
          Administration
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-12 space-y-2">
        {menuItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex items-center justify-between p-4 group transition-all duration-300 rounded-lg",
              pathname.startsWith(item.href) 
                ? "bg-luxury-gold text-white shadow-lg" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <div className="flex items-center gap-4">
              <item.icon className={cn(
                "w-5 h-5",
                pathname.startsWith(item.href) ? "text-white" : "text-luxury-gold"
              )} />
              <span className="text-[11px] uppercase tracking-[0.2em] font-bold">
                {item.name}
              </span>
            </div>
            <ChevronRight className={cn(
              "w-4 h-4 transition-transform",
              pathname.startsWith(item.href) ? "opacity-100 rotate-90" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
            )} />
          </Link>
        ))}
      </nav>

      {/* Footer / Account */}
      <div className="p-8 border-t border-white/5 space-y-6">
        <div className="flex items-center gap-4 px-2">
          <div className="w-10 h-10 rounded-full bg-luxury-gold flex items-center justify-center font-black text-white">
            AD
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest">Administrateur</p>
            <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Maison Zuri</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 text-[10px] uppercase tracking-[0.3em] font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all rounded-lg"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
