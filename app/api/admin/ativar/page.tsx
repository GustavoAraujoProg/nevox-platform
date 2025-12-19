import { useState } from 'react';
import { Zap, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AtivarUsuario() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const ativar = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/admin/force-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error || 'Erro ao ativar');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Erro de conexão');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Zap className="w-8 h-8 text-yellow-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Ativação Manual</h1>
        <p className="text-gray-400 text-center text-sm mb-8">
          Use isso enquanto o webhook não funciona
        </p>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email do usuário"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
          />

          <button
            onClick={ativar}
            disabled={status === 'loading' || !email}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
          >
            {status === 'loading' ? 'Ativando...' : 'Ativar Usuário'}
          </button>
        </div>

        {status === 'success' && (
          <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-green-400 font-bold text-sm">Sucesso!</p>
              <p className="text-green-200 text-xs mt-1">{message}</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-bold text-sm">Erro!</p>
              <p className="text-red-200 text-xs mt-1">{message}</p>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-zinc-800 rounded-xl text-xs text-gray-400">
          <p className="font-bold text-white mb-2">💡 Instruções:</p>
          <ol className="space-y-1 list-decimal list-inside">
            <li>Digite o email do usuário que pagou</li>
            <li>Clique em "Ativar Usuário"</li>
            <li>Peça pro usuário fazer logout e login</li>
            <li>Dashboard liberado! ✅</li>
          </ol>
        </div>
      </div>
    </div>
  );
}