"use client";

import React from "react";
import { motion } from "framer-motion";

function ProjectStatusCards({ title, status, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -6,
        transition: { duration: 0.18 },
      }}
      className="relative bg-white p-6 rounded-[20px] overflow-hidden shadow-[0px_0px_22.3px_0px_rgba(0,0,0,0.08)]"
    >
      {/* Top Left */} <h3 className="text-gray-600 font-medium">{title}</h3>
      {/* Bottom Left */}
      <div className="mt-8">
        <p className="text-3xl font-bold">{status}</p>
      </div>
      {/* Grey Circle */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        className="absolute right-[-20px] bottom-[-20px] w-[108px] h-[108px] rounded-full bg-[#E3E3E3]"
      />
      {/* Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        whileHover={{ scale: 1.08, rotate: 4 }}
        className="absolute right-13 bottom-8 w-12 h-12"
      >
        <div className="w-full h-full flex items-end justify-end">{icon}</div>
      </motion.div>
    </motion.div>
  );
}

export default ProjectStatusCards;
