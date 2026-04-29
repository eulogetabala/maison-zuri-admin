'use client';

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { Lock, Mail, Send, AlertCircle } from 'lucide-react';

const LOGIN_MUTATION = gql`
  mutation LoginAdmin($email: String!, $password: String!) {
    loginAdmin(email: $email, password: $password) {
      token
      user {
        email
        displayName
      }
    }
  }
`;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data: any) => {
      Cookies.set('admin_token', data.loginAdmin.token, { expires: 1 }); // 24h
      router.push('/dashboard');
    },
    onError: (err) => {
      setError(err.message || 'Identifiants invalides');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    login({ variables: { email, password } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-gray relative overflow-hidden">
      {/* Aesthetic Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-white hidden lg:block" />
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-luxury-gold/5 blur-[120px]" />
      
      <div className="max-w-5xl w-full flex bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] relative z-10 min-h-[650px] rounded-lg overflow-hidden">
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 bg-luxury-black p-16 text-white">
          <div>
            <h1 className="text-4xl font-serif tracking-[0.2em] font-black uppercase text-luxury-gold mb-4">
              Maison Zuri
            </h1>
            <div className="w-12 h-0.5 bg-luxury-gold" />
          </div>
          
          <div className="space-y-8">
            <h2 className="text-5xl font-serif leading-tight">
              L&apos;art de la gestion <br />
              <span className="text-luxury-gold italic">haut de gamme.</span>
            </h2>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-bold max-w-xs leading-relaxed">
              Accédez à votre espace sécurisé pour piloter vos collections et vos commandes clients.
            </p>
          </div>
          
          <div className="text-[9px] uppercase tracking-widest text-white/20 font-bold">
            &copy; 2025 Maison Zuri &bull; Tous droits réservés
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 p-12 md:p-20 flex flex-col justify-center">
          <div className="mb-12">
            <h3 className="text-sm uppercase tracking-[0.3em] font-black text-luxury-black mb-2">Bienvenue</h3>
            <p className="text-luxury-black/40 text-xs font-medium">Connectez-vous pour continuer vers le dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-black text-luxury-black/60">Email Professionnel</label>
              <div className="relative group">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-black group-focus-within:text-luxury-gold transition-colors" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@maisonzuri.com"
                  className="w-full bg-transparent border-b border-luxury-black/10 py-5 pl-8 text-sm font-medium focus:border-luxury-gold outline-none transition-all placeholder:text-luxury-black/20"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-black text-luxury-black/60">Mot de Passe</label>
              <div className="relative group">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-black group-focus-within:text-luxury-gold transition-colors" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full bg-transparent border-b border-luxury-black/10 py-5 pl-8 text-sm font-medium focus:border-luxury-gold outline-none transition-all placeholder:text-luxury-black/20"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-lg text-xs font-bold uppercase tracking-widest"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-luxury-black text-white py-6 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-luxury-gold transition-all duration-500 flex items-center justify-center gap-4 group shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Se Connecter
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-16 text-center text-luxury-black/30 text-[9px] uppercase tracking-widest leading-relaxed">
            Espace strictement réservé au personnel Maison Zuri. <br />
            Toute tentative d&apos;accès non autorisée sera enregistrée.
          </p>
        </div>
      </div>
    </div>
  );
}
