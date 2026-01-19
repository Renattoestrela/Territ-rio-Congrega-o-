
import React, { useState, useEffect } from 'react';
import { hasAdminConfigured, setupAdmin, validateCredentials } from '../services/storage';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFirstRun(!hasAdminConfigured());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simular um pequeno delay para passar uma sensação de processamento/segurança
    setTimeout(() => {
      if (isFirstRun) {
        if (username.length < 3) {
          setError('O usuário deve ter pelo menos 3 caracteres.');
          setLoading(false);
          return;
        }
        if (password.length < 4) {
          setError('A senha deve ter pelo menos 4 caracteres.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('As senhas não coincidem.');
          setLoading(false);
          return;
        }
        setupAdmin(username, password);
        onLoginSuccess();
      } else {
        if (validateCredentials(username, password)) {
          onLoginSuccess();
        } else {
          setError('Usuário ou senha inválidos.');
          setLoading(false);
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      
      <div className="max-w-md w-full relative">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-8 text-center border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-indigo-500/20 transform rotate-3">
              <span className="text-4xl">🗺️</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Portal de Territórios</h1>
            <p className="text-slate-400 text-sm mt-2">
              {isFirstRun 
                ? 'Configure o acesso mestre da congregação.' 
                : 'Acesse o sistema de gerenciamento.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-500/10 text-red-400 text-xs p-3 rounded-xl border border-red-500/20 text-center animate-shake">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-widest">Usuário</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu nome de usuário"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-11 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-widest">Senha</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-11 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            {isFirstRun && (
              <div className="pt-2 animate-fadeIn">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1 tracking-widest">Confirmar Senha</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🛡️</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-11 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 flex justify-center items-center gap-2 shadow-xl shadow-indigo-600/10 ${
                loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isFirstRun ? 'Criar Acesso Administrador' : 'Entrar no Sistema'
              )}
            </button>
          </form>

          <div className="p-6 bg-white/5 text-center">
             <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest font-medium">
               Acesso Restrito &copy; {new Date().getFullYear()}
             </p>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-500 text-xs">
          Nota: Os dados deste sistema são armazenados localmente neste navegador.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default Login;
