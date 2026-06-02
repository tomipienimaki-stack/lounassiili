"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, ExternalLink, Leaf } from "lucide-react";

interface MenuItem {
  name: string;
  diets: string[];
  today?: boolean;
}

interface RestaurantProps {
  name: string;
  address: string;
  hours: string;
  price: string;
  url: string;
  menu: MenuItem[];
  distance?: string;
  fixedMenu?: boolean;
  fixedMenuNote?: string;
}

export function RestaurantCard({ name, address, hours, price, url, menu, distance, fixedMenu, fixedMenuNote }: RestaurantProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl p-5 sm:p-6 h-full flex flex-col min-w-0 break-words"
    >
      <div className="flex justify-between items-start gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl sm:text-2xl font-bold mb-1">{name}</h3>
          <div className="flex items-start gap-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{address} {distance && `• ${distance}`}</span>
          </div>
        </div>
        <div className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap">
          {price}
        </div>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
        <Clock className="w-4 h-4" />
        <span>{hours}</span>
      </div>

      <div className="flex-grow space-y-3">
        {fixedMenu && fixedMenuNote && (
          <p className="text-xs italic text-muted-foreground mb-2">{fixedMenuNote}</p>
        )}
        {menu.length > 0 ? (
          menu.map((item, idx) => {
            // Three states:
            //   today === true   → highlight (weekly-list scrapers, today's items)
            //   today === false  → dim       (weekly-list scrapers, other days)
            //   today undefined  → normal    (today-only scrapers, everything is today)
            const isHighlight = item.today === true;
            const isDim = item.today === false;
            return (
              <div
                key={idx}
                className={
                  isHighlight
                    ? "group rounded-lg border-l-4 border-secondary bg-secondary/10 px-3 py-2"
                    : isDim
                      ? "group border-b border-white/5 pb-3 last:border-0 opacity-50 hover:opacity-100 transition-opacity"
                      : "group border-b border-white/5 pb-3 last:border-0"
                }
              >
                <p className={
                  isHighlight
                    ? "font-semibold text-foreground"
                    : "font-medium group-hover:text-primary transition-colors"
                }>{item.name}</p>
                {item.diets.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.diets.map((diet, dIdx) => (
                      <span key={dIdx} className="text-[10px] uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-md flex items-center gap-1">
                        {diet}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-muted-foreground italic text-sm">Lounaslistaa ei löytynyt tälle päivälle.</p>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-white/5">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-secondary transition-all active:scale-95"
        >
          <span>Katso sivu</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
}
