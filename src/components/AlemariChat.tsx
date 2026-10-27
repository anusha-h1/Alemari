import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Bot, Compass, MessageCircle, MoreHorizontal, RotateCcw, Sparkles, X } from 'lucide-react';
import { answerTravelQuestion } from '../services/assistant';
import { requestAssistantAnswer } from '../services/api';
import type { TravelMemory } from '../types';

interface ChatMessage { id: string; role: 'user' | 'assistant'; text: string; }
const prompts = ['Plan a two-day trip under ₹3,000.', 'Suggest peaceful places near Coorg.', 'Where should I go this weekend?', 'What are the best waterfalls in Karnataka?', 'Suggest a family-friendly trip.', 'Show me hidden gems.', 'Plan a heritage trip around Hampi and Badami.', 'Suggest places based on my interests.', 'What should I explore next?'];

export function AlemariChat({ interests, visited, memories, availableDays }: { interests: string[]; visited: string[]; memories: TravelMemory[]; availableDays: number }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const timeout = useRef<number | undefined>(undefined);
  useEffect(() => { if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, thinking, open]);
  useEffect(() => { const handleOpen = () => setOpen(true); window.addEventListener('alemari-open-chat', handleOpen); return () => window.removeEventListener('alemari-open-chat', handleOpen); }, []);
  useEffect(() => () => window.clearTimeout(timeout.current), []);
  const sendMessage = async (raw: string) => {
    const text = raw.trim(); if (!text || thinking) return;
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', text }]); setInput(''); setThinking(true);
    timeout.current = window.setTimeout(async () => {
      let response: string;
      try { response = await requestAssistantAnswer(text, { interests, visitedIds: visited, memories, availableDays }); }
      catch { response = answerTravelQuestion(text, { interests, visitedIds: visited, memories, availableDays }); }
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', text: response }]); setThinking(false);
    }, 350);
  };
  return <>
    <button className={`chat-fab ${open ? 'chat-fab-open' : ''}`} onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close Alemari Mitra' : 'Open Alemari Mitra'} aria-expanded={open}><span>{open ? <X size={21} /> : <MessageCircle size={22} />}</span>{!open && <i className="chat-fab-pulse" />}</button>
    <AnimatePresence>{open && <motion.aside className="chat-panel" initial={{ opacity: 0, y: 20, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: .98 }} transition={{ type: 'spring', damping: 24, stiffness: 260 }} role="dialog" aria-label="Alemari Mitra travel assistant">
      <header className="chat-header"><div className="chat-avatar"><Compass size={20} /></div><div><b>ಅಲೆಮಾರಿ ಮಿತ್ರ</b><span>Alemari Mitra · Your local travel buddy</span></div><button className="chat-clear" onClick={() => { window.clearTimeout(timeout.current); setThinking(false); setMessages([]); }} aria-label="Clear conversation" title="Clear conversation"><RotateCcw size={15} /></button><button className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button></header>
      <div className="chat-history" ref={listRef}>
        <div className="chat-greeting"><div className="chat-spark"><Sparkles size={15} /></div><span className="eyebrow">A THOUGHT FOR YOUR NEXT JOURNEY</span><p>Hello. I can shape a local trip idea around a place, a feeling, or a few free days. What would you like to discover?</p><small>Suggestions are generated locally from the Karnataka places in this demo.</small></div>
        {messages.map((message) => <div key={message.id} className={`chat-message chat-message-${message.role}`}><span>{message.role === 'assistant' ? <Compass size={14} /> : 'You'}</span><p>{message.text}</p></div>)}
        {thinking && <div className="chat-typing"><span><Bot size={14} /></span><i /><i /><i /><small>Thinking about the route…</small></div>}
        {messages.length === 0 && <div className="chat-prompts">{prompts.map((prompt) => <button key={prompt} onClick={() => sendMessage(prompt)}>{prompt}<ArrowUp size={13} /></button>)}</div>}
      </div>
      <form className="chat-input-row" onSubmit={(event) => { event.preventDefault(); sendMessage(input); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about a Karnataka journey…" aria-label="Message Alemari Mitra" /><button type="submit" aria-label="Send message" disabled={!input.trim() || thinking}><ArrowUp size={17} /></button></form>
      <div className="chat-disclaimer"><MoreHorizontal size={14} />Local demonstration · approximate suggestions, no live prices</div>
    </motion.aside>}</AnimatePresence>
  </>;
}
