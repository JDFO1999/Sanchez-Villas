const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

c = c.replace(/import \{ useTheme \} from "next-themes"/, 'import { useTheme } from "next-themes"\nimport { Footer } from "./footer"');

// Inject isSidebarCollapsed state
c = c.replace(/  const \[sidebarOpen, setSidebarOpen\] = useState\(false\)/, `  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Initialize from localStorage if exists
  useEffect(() => {
    const stored = localStorage.getItem('gympro_sidebar_collapsed')
    if (stored === 'true') {
      setIsSidebarCollapsed(true)
    }
  }, [])
  
  const toggleSidebarCollapse = () => {
    const newState = !isSidebarCollapsed
    setIsSidebarCollapsed(newState)
    localStorage.setItem('gympro_sidebar_collapsed', String(newState))
  }`);

// Adjust Sidebar classes
c = c.replace(/className="hidden lg:flex flex-col w-64 bg-card border-r border-black\/10 dark:border-white\/10 transition-colors"/,
`className={\`hidden lg:flex flex-col bg-card border-r border-black/10 dark:border-white/10 transition-all duration-300 \${isSidebarCollapsed ? 'w-20' : 'w-64'}\`}`);

// Adjust logo rendering based on collapse state
c = c.replace(/              settings\.logoUrl \? \(/, `              settings.logoUrl && !isSidebarCollapsed ? (`);
c = c.replace(/                <span className="font-black text-2xl tracking-tighter bg-gradient-to-r from-primary via-black to-primary\/50 bg-clip-text text-transparent drop-shadow-sm">/, 
`                <span className={\`font-black text-2xl tracking-tighter bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent drop-shadow-sm \${isSidebarCollapsed ? 'hidden' : 'block'}\`}>`);

// Adjust nav items to hide text when collapsed
c = c.replace(/                      <span className="font-medium">\{item\.name\}<\/span>/, `                      <span className={\`font-medium \${isSidebarCollapsed ? 'hidden' : 'block'}\`}>{item.name}</span>`);

// Adjust user profile section at bottom of sidebar
c = c.replace(/              <div className="flex-1 min-w-0">/, `              <div className={\`flex-1 min-w-0 \${isSidebarCollapsed ? 'hidden' : 'block'}\`}>`);

// Add toggle collapse button at the bottom of the sidebar
const collapseButton = `
          {/* Collapse Toggle */}
          <button 
            onClick={toggleSidebarCollapse}
            className="w-full p-4 flex items-center justify-center text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-t border-black/5 dark:border-white/5"
          >
            <svg className={\`h-5 w-5 transition-transform \${isSidebarCollapsed ? 'rotate-180' : ''}\`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        </div>
      </aside>`;

c = c.replace(/        <\/div>\r?\n      <\/aside>/, collapseButton);

// Adjust main content to include Footer
const mainContent = `          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            {children}
          </div>
          <Footer />
        </main>`;

c = c.replace(/          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">\r?\n            \{children\}\r?\n          <\/div>\r?\n        <\/main>/, mainContent);

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("App layout patched");
