import { motion } from 'framer-motion';
import { Mic, Video, Type, CheckCircle2, Wand2 } from 'lucide-react';
import styles from './VoiceToAppHero.module.css';

interface VoiceToAppHeroProps {
  onVoiceClick: () => void;
  onRecordingClick: () => void;
  onTypeClick: () => void;
}

export default function VoiceToAppHero({ onVoiceClick, onRecordingClick, onTypeClick }: VoiceToAppHeroProps) {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroBackground} />
      
      <div className={styles.heroContent}>
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={styles.badge}
        >
          <Wand2 className="w-3.5 h-3.5" />
          Voice-to-App Enabled
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className={styles.headline}
        >
          Speak Your Software Into Existence
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className={styles.subheadline}
        >
          Show us your current tools. Tell us what workflows matter. Bridgebox uses AI to understand your software and automatically generate the perfect custom platform for your business.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5, delay: 0.3 }}
          className={styles.featuresList}
        >
          <div className={styles.featureItem}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free from complex discovery
          </div>
          <div className={styles.featureItem}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated software intelligence
          </div>
          <div className={styles.featureItem}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Built specifically for your workflows
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className={styles.ctaGroup}
        >
          <button className={styles.primaryCta} onClick={onVoiceClick}>
            <div className={`${styles.primaryCtaIcon} ${styles.pulseAnimation}`}>
              <Mic className="w-4 h-4 text-white" />
            </div>
            Speak Your App
          </button>
          
          <button className={styles.secondaryCta} onClick={onRecordingClick}>
            <Video className="w-5 h-5 text-violet-400" />
            Upload Recording
          </button>
          
          <button className={styles.secondaryCta} onClick={onTypeClick}>
            <Type className="w-5 h-5 text-cyan-400" />
            Start Typed Request
          </button>
        </motion.div>
      </div>
    </div>
  );
}
