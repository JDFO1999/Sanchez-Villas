const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

const headerRegex = /<header className="flex items-center justify-between h-16 px-4 border-b bg-card">[\s\S]*?<\/header>/;

const newHeader = `<header className="flex items-center justify-between h-16 px-4 border-b bg-card">
            <div className="flex items-center gap-4">
              <button 
                className="text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition-colors"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setSidebarOpen(true);
                  } else {
                    toggleSidebarCollapse();
                  }
                }}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className={!isSidebarCollapsed ? "lg:hidden" : ""}>
                <LogoComponent />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition-colors"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </header>`;

c = c.replace(headerRegex, newHeader);

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("Rewrote header");
