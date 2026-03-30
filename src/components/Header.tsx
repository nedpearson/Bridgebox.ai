import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BridgeboxLogo } from "./ui/BridgeboxLogo";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { navbarReveal } from "../utils/animations";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setScrolled(latest > 50);
    });
  }, [scrollY]);

  const navLinks = [
    { name: "Platform", path: "/platform" },
    { name: "Solutions", path: "/solutions" },
    { name: "Services", path: "/services" },
    { name: "Industries", path: "/industries" },
    { name: "Case Studies", path: "/case-studies" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header
      variants={navbarReveal}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "bg-[#0B0F1A]/95 backdrop-blur-xl border-white/10 shadow-lg shadow-black/20"
          : "bg-[#0B0F1A]/80 backdrop-blur-lg border-white/5"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <BridgeboxLogo className="w-8 h-8 text-indigo-500 group-hover:text-[#10B981] transition-colors duration-300" />
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl group-hover:bg-[#10B981]/20 transition-colors duration-300" />
            </div>
            <span className="text-2xl font-bold text-white">Bridgebox</span>
            <span className="text-sm font-medium text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded">
              AI
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium transition-colors duration-300 group ${
                  isActive(link.path)
                    ? "text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {link.name}
                {isActive(link.path) ? (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-[1.65rem] left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-[#10B981]"
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : (
                  <span className="absolute -bottom-[1.65rem] left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-[#10B981] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
            >
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/sales-onboarding"
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 inline-block"
              >
                Start a Project
              </Link>
            </motion.div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#0B0F1A]/95 backdrop-blur-lg border-t border-white/5"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block text-base font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? "text-indigo-500"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center py-2.5 text-slate-300 font-medium rounded-lg hover:bg-white/5 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/sales-onboarding"
                  onClick={() => setIsOpen(false)}
                  className="block text-center py-2.5 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition-colors duration-200"
                >
                  Start a Project
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
