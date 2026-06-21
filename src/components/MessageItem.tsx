import { useState, useRef } from "react";
import { Copy, Check, Volume2, Image as ImageIcon, Download, Bot, User, Sparkles, Loader2, Play, Pause } from "lucide-react";
import { Message } from "../types";
import Markdown from 'react-markdown';

interface MessageItemProps {
  message: Message;
  selectedVoice: string;
}

export default function MessageItem({ message, selectedVoice }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioUrlState, setAudioUrlState] = useState<string | null>(message.audioUrl || null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const handleSpeech = async () => {
    if (audioUrlState) {
      // Toggle play/pause
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error("Playback error:", err));
        }
      }
      return;
    }

    setLoadingAudio(true);
    try {
      // Prepare clean text, strip markdown formatting
      const cleanText = message.content
        .replace(/[*#`_\-]/g, "") // remove formatting symbols
        .substring(0, 300); // chunk limit for TTS

      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, voice: selectedVoice }),
      });

      if (!response.ok) {
        throw new Error("Ovoz hosil qilishda xatolik yuz berdi");
      }

      const data = await response.json();
      if (data.audioUrl) {
        setAudioUrlState(data.audioUrl);
        // Play audio directly
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(err => console.error("Audio autoplay failed:", err));
      }
    } catch (error) {
      console.error(error);
      alert("Ovozli sintez muvaffaqiyatsiz tugadi. Aloqani tekshiring.");
    } finally {
      setLoadingAudio(false);
    }
  };

  const handleAudioDownload = () => {
    if (!audioUrlState) return;
    const a = document.createElement("a");
    a.href = audioUrlState;
    a.download = `veloxai_ovoz_${message.id}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImageDownload = () => {
    if (!message.imageUrl) return;
    const a = document.createElement("a");
    a.href = message.imageUrl;
    a.download = `veloxai_tasvir_${message.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      id={`msg-${message.id}`}
      className={`flex gap-4 p-4 md:p-6 rounded-3xl transition-all duration-300 ${
        isUser
          ? "bg-slate-900/30 border border-slate-900/40 ml-12"
          : message.isError
          ? "bg-rose-500/5 border border-rose-500/10 mr-12"
          : "bg-slate-900/80 border border-slate-850 mr-12 shadow-xs"
      }`}
    >
      {/* Avatar Icon */}
      <div className="shrink-0">
        {isUser ? (
          <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <User className="h-4.5 w-4.5" />
          </div>
        ) : (
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
            <Bot className="h-4.5 w-4.5" />
          </div>
        )}
      </div>

      {/* Message Content Area */}
      <div className="flex-1 space-y-4 overflow-hidden">
        {/* Header Sender Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">
              {isUser ? "Siz" : "VeloxAI"}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {message.timestamp}
            </span>
            {message.mode === 'image' && (
              <span className="px-1.5 py-0.5 text-[9px] font-semibold text-cyan-400 bg-cyan-500/10 rounded border border-cyan-500/20 uppercase tracking-widest">
                Tasvir
              </span>
            )}
            {message.mode === 'voice' && (
              <span className="px-1.5 py-0.5 text-[9px] font-semibold text-violet-400 bg-violet-500/10 rounded border border-violet-500/20 uppercase tracking-widest">
                Ovoz
              </span>
            )}
          </div>

          {/* Action Tools (Copy / TTS) */}
          {!isUser && !message.isError && (
            <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition">
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                title="Nusxalash"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              {message.content && !message.imageUrl && (
                <button
                  onClick={handleSpeech}
                  disabled={loadingAudio}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer flex items-center justify-center disabled:opacity-50"
                  title="Ovozli o'qish"
                >
                  {loadingAudio ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                  ) : isPlaying ? (
                    <Pause className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Text body or Image body */}
        <div className="space-y-4">
          {message.imageUrl && (
            <div className="space-y-3">
              <div className="relative group max-w-lg rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square md:aspect-video flex items-center justify-center">
                <img
                  src={message.imageUrl}
                  alt={message.content}
                  className="max-h-full max-w-full object-contain select-none transition-transform duration-500 group-hover:scale-101"
                  referrerPolicy="no-referrer"
                />
                
                {/* Image Overlay Controls */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button
                    onClick={handleImageDownload}
                    className="p-3 bg-white hover:bg-slate-100 text-slate-950 rounded-xl transition duration-200 flex items-center gap-2 text-xs font-semibold shadow-xl cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Tasvirni saqlash
                  </button>
                </div>
              </div>
              <p className="text-xs italic text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-850/50 inline-block">
                <strong>Prompt:</strong> &ldquo;{message.content}&rdquo;
              </p>
            </div>
          )}

          {!message.imageUrl && message.content && (
            <div className="markdown-body">
              <Markdown>{message.content}</Markdown>
            </div>
          )}

          {/* Render Inline Audio Player if synthetic sound exists */}
          {audioUrlState && (
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-900/80 p-3 rounded-2xl max-w-md">
              <button
                onClick={handleSpeech}
                className="h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 transition"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white translate-x-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 truncate">Sintez qilingan ovoz</p>
                <p className="text-xs font-semibold text-white truncate">{selectedVoice} ovozi</p>
              </div>
              <button
                onClick={handleAudioDownload}
                className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition"
                title="Yuklab olish (WAV)"
              >
                <Download className="h-4 w-4" />
              </button>
              {/* Native audio tag helper */}
              <audio
                ref={(el) => {
                  if (el) {
                    audioRef.current = el;
                    el.onended = () => setIsPlaying(false);
                  }
                }}
                src={audioUrlState}
                className="hidden"
                preload="auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
