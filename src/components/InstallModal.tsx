import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  MoreVertical,
  Menu,
  CheckCircle2,
  Globe,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export type DetectedBrowser = 'opera' | 'safari' | 'chrome' | 'samsung' | 'firefox' | 'other';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNativeInstall?: () => void;
  hasNativePrompt?: boolean;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  onNativeInstall,
  hasNativePrompt = false,
}) => {
  const [detectedBrowser, setDetectedBrowser] = useState<DetectedBrowser>('other');
  const [activeTab, setActiveTab] = useState<DetectedBrowser>('opera');

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes('opr') || ua.includes('opera') || ua.includes('opt/')) {
      setDetectedBrowser('opera');
      setActiveTab('opera');
    } else if (/iphone|ipad|ipod/.test(ua) || (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android'))) {
      setDetectedBrowser('safari');
      setActiveTab('safari');
    } else if (ua.includes('samsungbrowser')) {
      setDetectedBrowser('samsung');
      setActiveTab('samsung');
    } else if (ua.includes('firefox') || ua.includes('fxios')) {
      setDetectedBrowser('firefox');
      setActiveTab('firefox');
    } else if (ua.includes('chrome') || ua.includes('crios') || ua.includes('edg')) {
      setDetectedBrowser('chrome');
      setActiveTab('chrome');
    } else {
      setDetectedBrowser('other');
      setActiveTab('opera');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t sm:rounded p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-gradient-to-tr from-[#20C933] to-[#087A2A] flex items-center justify-center text-white font-black text-lg shadow-md">
              V
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">Instalar Aplicativo Vagou</h3>
              <p className="text-[11px] text-slate-500 font-medium">Instalação direta para qualquer navegador</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Native 1-Click Install Button if supported */}
        {hasNativePrompt && (
          <div className="bg-emerald-50 border border-emerald-200 rounded p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Instalação instantânea detectada!</span>
            </div>
            <button
              onClick={() => {
                if (onNativeInstall) onNativeInstall();
              }}
              className="w-full py-2.5 bg-[#20C933] hover:bg-[#087A2A] text-white font-bold text-xs rounded shadow transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Instalar em 1 Clique</span>
            </button>
          </div>
        )}

        {/* Browser Selector Tabs */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Escolha seu Navegador:
          </span>
          <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('opera')}
              className={`py-2 px-1 rounded transition flex flex-col items-center gap-1 ${
                activeTab === 'opera'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-xs">🔴</span>
              <span className="text-[10px] leading-none">Opera</span>
            </button>

            <button
              onClick={() => setActiveTab('chrome')}
              className={`py-2 px-1 rounded transition flex flex-col items-center gap-1 ${
                activeTab === 'chrome'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-xs">🟢</span>
              <span className="text-[10px] leading-none">Chrome</span>
            </button>

            <button
              onClick={() => setActiveTab('safari')}
              className={`py-2 px-1 rounded transition flex flex-col items-center gap-1 ${
                activeTab === 'safari'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-xs">🔵</span>
              <span className="text-[10px] leading-none">iPhone</span>
            </button>

            <button
              onClick={() => setActiveTab('samsung')}
              className={`py-2 px-1 rounded transition flex flex-col items-center gap-1 ${
                activeTab === 'samsung'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-xs">🟣</span>
              <span className="text-[10px] leading-none">Samsung</span>
            </button>

            <button
              onClick={() => setActiveTab('firefox')}
              className={`py-2 px-1 rounded transition flex flex-col items-center gap-1 ${
                activeTab === 'firefox'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-xs">🟠</span>
              <span className="text-[10px] leading-none">Firefox</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Instructions Per Browser */}
        <div className="bg-slate-50 border border-slate-200/90 rounded p-4 text-xs space-y-3">
          {activeTab === 'opera' && (
            <div className="space-y-2.5 text-slate-700">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <span className="w-5 h-5 rounded bg-rose-100 text-slate-950 flex items-center justify-center text-[10px] font-black border border-rose-200">O</span>
                <span>Como instalar no Opera / Opera GX:</span>
              </div>
              <ol className="space-y-2.5 list-decimal list-inside text-slate-600 leading-relaxed font-medium">
                <li className="pl-1">
                  Toque no <strong>ícone do Opera (O)</strong> ou nos <strong>três pontinhos ⋮</strong> no canto da barra de navegação.
                </li>
                <li className="pl-1">
                  Procure e selecione <strong>"Adicionar à tela de início"</strong> ou <strong>"Instalar aplicativo"</strong>.
                </li>
                <li className="pl-1">
                  Confirme em <strong>"Adicionar"</strong>. O ícone do Vagou ficará disponível junto aos seus apps nativos!
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'chrome' && (
            <div className="space-y-2.5 text-slate-700">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <MoreVertical className="w-4 h-4 text-emerald-600" />
                <span>Como instalar no Google Chrome / Edge:</span>
              </div>
              <ol className="space-y-2.5 list-decimal list-inside text-slate-600 leading-relaxed font-medium">
                <li className="pl-1">
                  Toque nos <strong>três pontinhos ⋮</strong> no canto superior direito do Chrome.
                </li>
                <li className="pl-1">
                  Toque em <strong>"Instalar aplicativo"</strong> (ou <em>"Adicionar à tela inicial"</em>).
                </li>
                <li className="pl-1">
                  Confirme em <strong>"Instalar"</strong>.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'safari' && (
            <div className="space-y-2.5 text-slate-700">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Como instalar no Safari (iPhone / iPad):</span>
              </div>
              <ol className="space-y-2.5 list-decimal list-inside text-slate-600 leading-relaxed font-medium">
                <li className="pl-1">
                  Toque no botão <strong>Compartilhar <Share2 className="w-3.5 h-3.5 inline text-blue-600 mx-0.5" /></strong> na barra inferior do Safari.
                </li>
                <li className="pl-1">
                  Role a lista e toque em <strong>"Adicionar à Tela de Início" <PlusSquare className="w-3.5 h-3.5 inline text-slate-800 mx-0.5" /></strong>.
                </li>
                <li className="pl-1">
                  Toque em <strong>"Adicionar"</strong> no canto superior direito.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'samsung' && (
            <div className="space-y-2.5 text-slate-700">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Menu className="w-4 h-4 text-purple-600" />
                <span>Como instalar no Samsung Internet:</span>
              </div>
              <ol className="space-y-2.5 list-decimal list-inside text-slate-600 leading-relaxed font-medium">
                <li className="pl-1">
                  Toque no ícone de <strong>Download ⬇️</strong> na barra de endereço ou no menu de <strong>três linhas ≡</strong> no canto inferior.
                </li>
                <li className="pl-1">
                  Selecione <strong>"Adicionar página a"</strong> ➔ <strong>"Tela inicial"</strong>.
                </li>
                <li className="pl-1">
                  Toque em <strong>"Adicionar"</strong>.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'firefox' && (
            <div className="space-y-2.5 text-slate-700">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <MoreVertical className="w-4 h-4 text-orange-600" />
                <span>Como instalar no Mozilla Firefox:</span>
              </div>
              <ol className="space-y-2.5 list-decimal list-inside text-slate-600 leading-relaxed font-medium">
                <li className="pl-1">
                  Toque nos <strong>três pontinhos ⋮</strong> ao lado da barra de endereço.
                </li>
                <li className="pl-1">
                  Toque em <strong>"Instalar"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Benefits list */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 pt-1">
          <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded border border-slate-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Tela cheia sem barras</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded border border-slate-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Carregamento instantâneo</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#151A1E] hover:bg-slate-800 text-white font-bold text-xs rounded shadow transition"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
