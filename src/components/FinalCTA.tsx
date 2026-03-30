import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Button from "./Button";
import Section from "./Section";
import { useLeadModal } from "../hooks/useLeadModal";

interface FinalCTAProps {
  headline?: string;
  subtext?: string;
  primaryCTA?: string;
  secondaryCTA?: string;
  showTrustLine?: boolean;
}

export default function FinalCTA({
  headline = "Let's Build Your System",
  subtext = "Bridgebox connects, automates, and builds the systems your business needs to scale.",
  primaryCTA = "Get a Demo",
  secondaryCTA = "Request Custom Build",
  showTrustLine = true,
}: FinalCTAProps) {
  const { openModal } = useLeadModal();

  return (
    <Section background="gradient" className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-4xl mx-auto"
      >
        {showTrustLine && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#10B981]" />
            <span className="text-sm font-medium text-slate-400 tracking-wide uppercase">
              Built for serious businesses. Designed to scale.
            </span>
            <Sparkles className="w-4 h-4 text-[#10B981]" />
          </motion.div>
        )}

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight"
        >
          {headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-xl text-slate-300 mb-10 leading-relaxed"
        >
          {subtext}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" onClick={openModal}>
            {primaryCTA} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" to="/start">
            {secondaryCTA}
          </Button>
        </motion.div>
      </motion.div>
    </Section>
  );
}
