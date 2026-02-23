'use client';

import { motion } from 'framer-motion';
import { AppLogo } from './AppLogo';

export function PageLoader() {
  return (
    <div className="h-screen w-full bg-black text-white relative">
      <motion.div
        className="absolute top-0 left-0 h-full w-full flex flex-col items-center justify-center gap-6 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <AppLogo
            height={56}
            width={200}
            className="brightness-0 invert"
          />
        </motion.div>
        <div className="h-[30px] overflow-hidden">
          <motion.div
            className="text-white text-xl tracking-[12px] uppercase font-bold"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          >
            SendCoins Admin
          </motion.div>
        </div>
        <motion.div
          className="h-1 w-24 bg-white/30 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '60%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
