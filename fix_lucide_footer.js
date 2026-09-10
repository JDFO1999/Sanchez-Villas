const fs = require('fs');
let c = fs.readFileSync('components/layout/footer.tsx', 'utf8');

c = c.replace(/import \{ Instagram, Facebook, MapPin, Navigation \} from "lucide-react";/, 'import { MapPin } from "lucide-react";');
c = c.replace(/<Instagram className="h-5 w-5" \/>/, '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>');
c = c.replace(/<Facebook className="h-5 w-5" \/>/, '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>');

fs.writeFileSync('components/layout/footer.tsx', c, 'utf8');
console.log("Fixed lucide imports in footer");
