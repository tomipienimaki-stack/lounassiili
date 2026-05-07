"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { RestaurantCard } from "@/components/RestaurantCard";
import { restaurants, Restaurant } from "@/data/restaurants";
import { motion, AnimatePresence } from "framer-motion";
import { Filter } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("kaikki");
  const [menus, setMenus] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching menus
    // In a real app, we would call an API route that runs the scrapers
    const fetchMenus = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/menus");
        const data = await res.json();
        if (data.menus) {
          setMenus(data.menus);
        }
      } catch (e) {
        console.error("Failed to fetch menus:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const filteredRestaurants = restaurants.filter(r => 
    activeTab === "kaikki" || r.location === activeTab
  );

  const tabs = [
    { id: "kaikki", label: "Kaikki" },
    { id: "ruoholahti", label: "Ruoholahti" },
    { id: "keskusta", label: "Keskusta" },
    { id: "kangasala", label: "Kangasala" },
    { id: "hameenlinna", label: "Hämeenlinna" }
  ];

  return (
    <main className="min-h-screen pb-20">
      <Header />

      <div className="max-w-6xl mx-auto px-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-12">
          <div className="flex items-center gap-2 text-secondary font-bold mr-4">
            <Filter className="w-5 h-5" />
            <span>Suodata:</span>
          </div>
          <div className="flex bg-muted/30 p-1 rounded-2xl backdrop-blur-sm border border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredRestaurants.map((restaurant) => (
              <motion.div
                key={restaurant.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <RestaurantCard
                  {...restaurant}
                  menu={menus[restaurant.id]?.items || []}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Ei ravintoloita valitulla alueella.</p>
          </div>
        )}
      </div>

      <footer className="mt-20 border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image src="/mascot.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold">Lounas<span className="text-secondary">siili</span></span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2026 Lounassiili. Tehty rakkaudella ja nälällä.
          </p>
        </div>
      </footer>
    </main>
  );
}

import Image from "next/image";
