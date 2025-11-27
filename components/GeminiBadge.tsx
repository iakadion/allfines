import React, { useState } from 'react';
import { generateSecurityAudit } from '../services/geminiService';
import { ShieldCheck } from 'lucide-react';

const GeminiBadge: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'checking' | 'verified'>('idle');
  const [message, setMessage] = useState('');

  const handleVerify = async () => {
    setStatus('checking');
    const msg = await generateSecurityAudit();
    setMessage(msg);
    setStatus('verified');
  };

  return (
    <div className="flex items-center space-x-3 bg-black/40 p-2 pr-4 rounded-full border border-agency-yellow/20 hover:border-agency-yellow transition-colors cursor-pointer group backdrop-blur-md" onClick={handleVerify}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status === 'verified' ? 'bg-agency-yellow/20 text-agency-yellow' : 'bg-slate-800 text-slate-400'} group-hover:bg-agency-yellow/10 transition-all`}>
        {status === 'checking' ? (
             <svg className="animate-spin h-4 w-4 text-agency-yellow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
        ) : (
             <ShieldCheck size={16} />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Security Status
        </span>
        <span className={`text-xs font-bold leading-tight ${status === 'verified' ? 'text-agency-yellow' : 'text-white'}`}>
            {status === 'verified' ? 'GEMINI & GOOGLE CERTIFIED' : 'CLICK TO VERIFY'}
        </span>
      </div>
      
      {/* Modal/Tooltip fallback for the message */}
      {message && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black border border-agency-yellow text-white text-sm p-4 rounded-none shadow-2xl z-50 w-72 text-center">
              <p className="font-display tracking-wide">{message}</p>
              <button onClick={(e) => {e.stopPropagation(); setMessage('')}} className="block w-full mt-3 text-xs text-slate-500 hover:text-agency-yellow uppercase tracking-widest">Close</button>
          </div>
      )}
    </div>
  );
};

export default GeminiBadge;