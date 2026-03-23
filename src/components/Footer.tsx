import { Link } from 'react-router-dom';
import { Box, Linkedin, Twitter, Github, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../utils/animations';

export default function Footer() {
  const footerLinks = {
    Product: [
      { name: 'Platform', path: '/platform' },
      { name: 'Solutions', path: '/solutions' },
      { name: 'Use Cases', path: '/use-cases' },
      { name: 'Pricing', path: '/contact' },
    ],
    Company: [
      { name: 'About', path: '/about' },
      { name: 'Contact', path: '/contact' },
      { name: 'Careers', path: '/contact' },
      { name: 'Blog', path: '/contact' },
    ],
    Resources: [
      { name: 'Case Studies', path: '/case-studies' },
      { name: 'Industries', path: '/industries' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Support', path: '/contact' },
    ],
    Legal: [
      { name: 'Privacy Policy', path: '/contact' },
      { name: 'Terms of Service', path: '/contact' },
      { name: 'Cookie Policy', path: '/contact' },
      { name: 'Compliance', path: '/contact' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer className="bg-black border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[#3B82F6]/5 via-transparent to-transparent opacity-30" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12"
        >
          <motion.div variants={staggerItem} className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                <Box className="w-8 h-8 text-[#3B82F6] group-hover:text-[#10B981] transition-colors duration-300" />
              </motion.div>
              <span className="text-xl font-bold text-white">Bridgebox</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Custom software, dashboards, mobile apps, and AI automation engineered for modern enterprise operations.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.1 }}
                  className="text-slate-400 hover:text-[#3B82F6] transition-colors duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {Object.entries(footerLinks).map(([category, links], catIndex) => (
            <motion.div key={category} variants={staggerItem} custom={catIndex}>
              <h3 className="text-sm font-semibold text-white mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Bridgebox AI. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <span className="text-sm text-slate-400">bridgebox.ai</span>
              <span className="text-slate-600">•</span>
              <span className="text-sm text-slate-400">bridgebox.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
