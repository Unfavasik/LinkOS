import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { MessageCircle, Phone, Navigation, BadgeCheck } from 'lucide-react';
import { DEMO_PROFILE, DEMO_PRODUCTS } from '../../data/demoData';

/**
 * Realistic phone mockup of the live demo business page.
 * Gently floats unless reduced motion is requested.
 */
export const PhoneMockup: React.FC = () => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      className="w-full max-w-[300px] rounded-[2.5rem] bg-[#141714] p-2.5 shadow-[0_40px_80px_-24px_rgba(20,23,20,0.45)]"
    >
      <div className="rounded-[2rem] bg-white overflow-hidden">
        {/* Notch */}
        <div className="h-7 flex items-center justify-center bg-white">
          <div className="w-20 h-1.5 rounded-full bg-[#141714]/90" />
        </div>

        <div className="px-4 pb-5 pt-1 text-center">
          <img
            src={DEMO_PROFILE.logo_url}
            alt={DEMO_PROFILE.business_name}
            className="w-16 h-16 mx-auto rounded-full object-cover ring-2 ring-white shadow-md border border-[#E3E5DF]"
          />
          <h3 className="mt-2.5 text-base font-bold text-[#141714] flex items-center justify-center gap-1">
            <span>{DEMO_PROFILE.business_name}</span>
            <BadgeCheck className="w-4 h-4 text-[#0B5B3B]" />
          </h3>
          <p className="text-[11px] text-[#565B54] mt-0.5">
            {DEMO_PROFILE.category} · {DEMO_PROFILE.city}
          </p>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Link
              to="/anant"
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#0B5B3B]/8 border border-[#0B5B3B]/20"
            >
              <div className="w-7 h-7 rounded-full bg-[#0B5B3B] text-white flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-[9px] font-bold text-[#0B5B3B]">WhatsApp</span>
            </Link>
            <Link
              to="/anant"
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#F3F4F1] border border-[#E3E5DF]"
            >
              <div className="w-7 h-7 rounded-full bg-[#141714] text-white flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-bold text-[#141714]">Call</span>
            </Link>
            <Link
              to="/anant"
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#F3F4F1] border border-[#E3E5DF]"
            >
              <div className="w-7 h-7 rounded-full bg-[#141714] text-white flex items-center justify-center">
                <Navigation className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-bold text-[#141714]">Map</span>
            </Link>
          </div>

          {/* Catalog */}
          <div className="mt-4 text-left">
            <div className="flex items-center justify-between px-0.5 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#141714]">
                Products
              </span>
              <span className="text-[10px] font-mono text-[#8A8F87]">
                {DEMO_PRODUCTS.length} items
              </span>
            </div>
            <div className="space-y-2">
              {DEMO_PRODUCTS.slice(0, 3).map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F3F4F1] border border-[#E3E5DF]"
                >
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-semibold text-[#141714] truncate">
                      {prod.name}
                    </h4>
                    <span className="text-[11px] font-bold text-[#141714]">
                      {prod.currency}
                      {prod.price.toLocaleString()}
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-[#141714] text-white text-[9px] font-semibold shrink-0">
                    Enquire
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/anant"
            className="mt-4 block w-full py-2.5 rounded-xl bg-[#141714] text-white text-[11px] font-semibold"
          >
            Open live demo
          </Link>
        </div>

        {/* Home indicator */}
        <div className="h-5 flex items-start justify-center bg-white">
          <div className="w-24 h-1 rounded-full bg-[#141714]/80" />
        </div>
      </div>
    </motion.div>
  );
};
