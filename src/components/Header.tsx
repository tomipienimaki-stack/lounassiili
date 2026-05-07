"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="relative py-12 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="relative w-32 h-32 md:w-48 md:h-48"
        >
          <div className="absolute inset-0 bg-secondary/30 rounded-full blur-3xl" />
          <Image
            src="/mascot.png"
            alt="Lounassiili Mascot"
            fill
            className="object-contain relative z-10"
            priority
          />
        </motion.div>
        
        <div className="text-center md:text-left">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-4"
          >
            Lounas<span className="text-secondary">siili</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-xl max-w-xl"
          >
            Päivän herkullisimmat lounaat Ruoholahden, Kangasalan ja keskustan parhaista ravintoloista.
          </motion.p>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
    </header>
  );
}
