import { Plus, MessageSquare, Trash2, Sparkles, Image, Volume2, ShieldAlert, History, Menu, X, Settings2 } from "lucide-react";
import { Conversation, AppMode } from "../types";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewConversation: (mode?: AppMode) => void;
  currentMode: AppMode;
  onChangeMode: (mode: AppMode) => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
  currentMode,
  onChangeMode,
  isOpen,
  onToggleSidebar,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onToggleSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300 pointer-events-auto"
        />
      )}

      <aside
        id="velox-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-900 flex flex-col transition-transform duration-300 ease-in-out h-full
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header Branding */}
        <div className="p-4 border-b border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Velox<span className="text-indigo-400 font-extrabold uppercase text-[10px] bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500">O'ta Tezkor va Aqlli AI</p>
            </div>
          </div>
          <button 
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white md:hidden"
            title="Sidebar yopish"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Toggle Modes */}
        <div className="p-4 space-y-1 z-10 border-b border-slate-900">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">Rejim Tanlang</p>
          
          <button
            onClick={() => onChangeMode('chat')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
              currentMode === 'chat'
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-300"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Suhbat (Intelligent Q&A)
          </button>

          <button
            onClick={() => onChangeMode('image')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
              currentMode === 'image'
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-300"
            }`}
          >
            <Image className="h-4 w-4" />
            Tasvir Yaratish (Image Gen)
          </button>

          <button
            onClick={() => onChangeMode('voice')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
              currentMode === 'voice'
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-300"
            }`}
          >
            <Volume2 className="h-4 w-4" />
            Ovozli Matn (Select voice)
          </button>
        </div>

        {/* New Conversation Action */}
        <div className="p-4">
          <button
            onClick={() => onNewConversation()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-850 text-white transition-all duration-300 rounded-xl text-xs font-semibold tracking-wide border border-slate-800 hover:border-slate-700 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4 text-indigo-400" />
            Yangi suhbat boshlash
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
            <History className="h-3.5 w-3.5" />
            <span>Suhbatlar Tarixi</span>
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-slate-900 rounded-2xl">
              <p className="text-xs text-slate-600">Suhbatlar mavjud emas</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative flex items-center justify-between rounded-xl p-2.5 transition-all duration-200 cursor-pointer ${
                    activeId === chat.id
                      ? "bg-slate-900 text-white border border-slate-800"
                      : "text-slate-400 hover:bg-slate-950 hover:text-slate-300 border border-transparent"
                  }`}
                  onClick={() => onSelectConversation(chat.id)}
                >
                  <div className="flex items-center gap-3 overflow-hidden pr-8">
                    <MessageSquare className={`h-4 w-4 shrink-0 ${activeId === chat.id ? "text-indigo-400" : "text-slate-500"}`} />
                    <span className="text-xs font-medium truncate select-none">
                      {chat.title}
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(chat.id);
                    }}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded-sm text-slate-500 hover:text-rose-400 hover:bg-slate-850 transition-all duration-150"
                    title="Muloqotni o'chirish"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info/controls */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-900 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/40 p-2.5 rounded-xl border border-slate-900">
            <ShieldAlert className="h-4 w-4 text-emerald-500 shrink-0" />
            <div className="text-[10px] leading-relaxed">
              Gemini 3.5 & 2.5 modellari bilan ishlaydi. Ma'lumotlar xavfsiz saqlanadi.
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span>VeloxAI v2.4.0</span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Aloqa faol
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
