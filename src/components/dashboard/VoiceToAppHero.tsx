import { motion } from 'framer-motion';
import { Mic, Video, Type, CheckCircle2, Wand2, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './VoiceToAppHero.module.css';

interface VoiceToAppHeroProps {
  onVoiceClick: () => void;
  onRecordingClick: () => void;
  onTypeClick: () => void;
}

const HOW_IT_WORKS = [
  { step: '01', label: 'Describe your current tools', detail: 'by voice, text, or recording' },
  { step: '02', label: 'Tell us what to keep and change', detail: 'features, workflows, frustrations' },
  { step: '03', label: 'Upload screen recordings', detail: 'optional — we\'ll extract the logic' },
  { step: '04', label: 'We generate your software blueprint', detail: 'custom-built for your business' },
];

export default function VoiceToAppHero({ onVoiceClick, onRecordingClick, onTypeClick }: VoiceToAppHeroProps) {
  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroBackground} />

      <div className={styles.heroContent}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={styles.badge}
        >
          <Wand2 className="w-3.5 h-3.5" />
          Bridgebox Voice Intelligence™
        </motion.div>

        {/* Headline + sub */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className={styles.headlineGroup}
        >
          <h1 className={styles.headline}>
            Your business deserves software<br />
            <span className={styles.headlineAccent}>built around how you actually work.</span>
          </h1>
          <p className={styles.subheadline}>
            Show us the tools you use today. Tell us what you want to keep, change, or remove.
            Bridgebox listens — by voice, text, or screen recording — and generates a custom software
            blueprint tailored to your exact workflows.
          </p>
        </motion.div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className={styles.ctaGroup}
        >
          <button className={styles.primaryCta} onClick={onVoiceClick} id="hero-speak-cta">
            <div className={`${styles.primaryCtaIcon} ${styles.pulseAnimation}`}>
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span>Start Speaking Your App</span>
            <ArrowRight className="w-4 h-4 opacity-70 ml-1" />
          </button>

          <button className={styles.secondaryCta} onClick={onRecordingClick} id="hero-recording-cta">
            <Video className="w-4.5 h-4.5 text-violet-400" />
            Upload Software Recording
          </button>

          <button className={styles.secondaryCta} onClick={onTypeClick} id="hero-type-cta">
            <Type className="w-4.5 h-4.5 text-cyan-400" />
            Describe in Writing
          </button>
        </motion.div>

        {/* Benefit pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className={styles.featuresList}
        >
          {[
            'No generic forms or questionnaires',
            'Works with recordings of your current software',
            'Generates a real implementation blueprint',
          ].map((item) => (
            <div key={item} className={styles.featureItem}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              {item}
            </div>
          ))}
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.38 }}
          className={styles.howItWorksRow}
        >
          <p className={styles.howItWorksLabel}>How it works</p>
          <div className={styles.stepsGrid}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} className={styles.step}>
                <span className={styles.stepNumber}>{s.step}</span>
                <div>
                  <p className={styles.stepTitle}>{s.label}</p>
                  <p className={styles.stepDetail}>{s.detail}</p>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ArrowRight className={styles.stepArrow} />
                )}
              </div>
            ))}
          </div>
          <Link
            to="/app/software-discovery"
            className={styles.discoveryLink}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Run full Software Discovery →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
