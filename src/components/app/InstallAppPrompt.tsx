import { useState, useEffect } from 'react';
import { Download, Monitor, Smartphone, X, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import Card from '../Card';

export default function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [showIosInstruction, setShowIosInstruction] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if currently running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    setShowDropdown(false);
    
    // Check if Mobile Device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (deferredPrompt) {
      // Show native prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosInstruction(true);
    } else if (!isMobile) {
      // They are on desktop but clicked install, but there's no deferred prompt.
      // Usually means already installed or unsupported browser.
      alert('Installation is managed via your browser setting icon (usually top right corner of the address bar), or the app is already installed.');
    }
  };

  const handleMobileOption = () => {
    setShowDropdown(false);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (isMobile) {
       // If they are literally on a mobile device tapping "Install Mobile"
       if (deferredPrompt) {
         handleInstallClick();
       } else if (isIos) {
         setShowIosInstruction(true);
       } else {
         alert('To install, tap your browser menu and select "Install App" or "Add to Home Screen".');
       }
    } else {
       // They are on Desktop clicking "Install Mobile" => Show QR code!
       setShowMobileModal(true);
    }
  };

  // Hide entirely if we are already securely inside the PWA natively.
  if (isStandalone) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.1)]"
        title="Install the App"
      >
        <Download className="w-4 h-4" />
        <span className="hidden md:inline">Install App</span>
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-2 overflow-hidden"
          >
            <div className="px-4 py-2 border-b border-slate-800/60 mb-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Versions</h4>
            </div>
            
            <button
              onClick={handleInstallClick}
              className="w-full flex items-start text-left px-4 py-3 hover:bg-slate-800/50 transition-colors group"
            >
              <Monitor className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform mt-0.5" />
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Desktop App</p>
                <p className="text-xs text-slate-400 mt-0.5">Install native app on Mac/PC</p>
              </div>
            </button>

            <button
              onClick={handleMobileOption}
              className="w-full flex items-start text-left px-4 py-3 hover:bg-slate-800/50 transition-colors border-t border-slate-800/50 group"
            >
              <Smartphone className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform mt-0.5" />
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Mobile App</p>
                <p className="text-xs text-slate-400 mt-0.5">Get it on iOS & Android</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop user trying to install on Mobile -> Target Device QR Handoff Modal */}
      <AnimatePresence>
        {showMobileModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm"
            >
              <Card glass className="p-8 border-indigo-500/30 shadow-2xl relative text-center">
                <button
                  onClick={() => setShowMobileModal(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Install on Mobile</h3>
                <p className="text-sm text-slate-400 mb-6">Scan this QR code with your iPhone or Android camera to instantly open and install the mobile version natively.</p>

                <div className="bg-white p-4 rounded-xl inline-block shadow-inner mx-auto">
                  <QRCodeSVG 
                    value={window.location.origin}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                
                <div className="mt-6 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                     <p className="text-xs text-slate-500">Scan QR Code</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                     <p className="text-xs text-slate-500">Follow the standard Install prompts</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* iOS Safari 'Add to Home Screen' Instructional Modal */}
      <AnimatePresence>
        {showIosInstruction && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-sm mx-auto"
            >
              <Card glass className="p-6 border-indigo-500/30 shadow-2xl relative text-center bg-slate-900/95">
                <button
                  onClick={() => setShowIosInstruction(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Download className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Install Mobile App</h3>
                <p className="text-sm text-slate-300 mb-4">Install Bridgebox securely onto your iPhone for full-screen App access natively.</p>
                
                <div className="bg-slate-800/50 text-left p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                    <p className="text-sm text-slate-300 pointer-events-none">Tap the <span className="text-blue-400 font-bold mx-1">Share</span> icon at the bottom of Safari.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                    <p className="text-sm text-slate-300 pointer-events-none">Scroll down and tap <span className="text-white font-bold mx-1">Add to Home Screen</span>.</p>
                  </div>
                </div>
              </Card>
            </motion.div>
            
            {/* Visual Pointer towards Safari Share bar */}
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
               className="w-full text-center pb-8 pt-4 pointer-events-none text-blue-400 flex flex-col items-center justify-center"
            >
               <span className="text-sm font-bold tracking-widest uppercase mb-2 shadow-black drop-shadow-lg">Tap Here</span>
               <svg className="w-8 h-8 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
