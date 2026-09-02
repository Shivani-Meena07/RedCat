import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { soundManager } from './SoundManager';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function FAQAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: 'escrow',
      question: 'How does the milestone escrow protect creators?',
      answer: "When a campaign brief is finalized, the brand deposits the dedicated contract budget into our secure, audited escrow vault. Creators can produce and deliver scripts and draft assets with absolute certainty that payouts will be instantly triggered the moment their content achieves pre-written verification milestones."
    },
    {
      id: 'analytics',
      question: 'How are the post-campaign analytics verified?',
      answer: "RedCat integrates directly with verified TikTok, YouTube, and Reels OAuth endpoints to capture first-party performance metrics (engagement, raw reach, audience retention, and click-throughs). This entirely eliminates fake screenshots, providing direct cryptographic auditing of reach data to both creators and brands."
    },
    {
      id: 'commission',
      question: 'Is there any platform commission fee?',
      answer: "We believe creators should keep their share. RedCat charges a clean, flat 5% transaction surcharge paid entirely on the Brand partner invoice to support cloud processing, smart brief generations, and automated escrow. Influencers receive a clean, 100% payout of the agreed contract value."
    },
    {
      id: 'privacy',
      question: 'How is user privacy and creator data encrypted?',
      answer: "All direct messages, brand product briefings, and payment metadata are protected under military-grade AES-256 standard and strict client-side database hashes. You maintain full ownership of your data and can request complete identity scrubbing with a single click."
    }
  ];

  const handleToggle = (id: string) => {
    if (openId === id) {
      soundManager.play('close');
      setOpenId(null);
    } else {
      soundManager.play('click');
      setOpenId(id);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4" id="faq-section">
      <div className="text-center mb-8">
        <h3 className="font-sans font-bold text-xl text-yellow-400 tracking-tight flex items-center justify-center gap-2">
          📖 Frequently Asked Questions
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Everything you need to know about the RedCat safe creator ecosystem
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="border-2 border-slate-700 rounded-lg overflow-hidden bg-slate-900/60 backdrop-blur-md transition-all duration-300"
              style={{
                borderColor: isOpen ? 'var(--gold, #facc15)' : '#334155',
                boxShadow: isOpen ? '0 0 15px rgba(250, 204, 21, 0.1)' : 'none'
              }}
            >
              <button
                onClick={() => handleToggle(faq.id)}
                className="w-full flex items-center justify-between p-4 text-left font-sans font-medium text-slate-200 hover:text-white transition-colors gap-4"
              >
                <span className="text-sm sm:text-base font-semibold">{faq.question}</span>
                <ChevronDown
                  className="w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: isOpen ? '#facc15' : undefined }}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="p-4 pt-0 border-t border-slate-800 text-sm leading-relaxed text-slate-300 bg-slate-950/40">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
