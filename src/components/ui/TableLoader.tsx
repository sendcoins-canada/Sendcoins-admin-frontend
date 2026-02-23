'use client';

import { motion } from 'framer-motion';
import { AppLogo } from './AppLogo';

export function TableLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[256px] py-12 bg-white">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <AppLogo height={32} width={140} className="opacity-90" />
        </motion.div>
        <motion.p
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading...
        </motion.p>
      </motion.div>
    </div>
  );
}
