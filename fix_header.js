const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

// 1. Remove the old collapse toggle button at the bottom of the sidebar
c = c.replace(/\{\/\* Collapse Toggle \*\/\}\r?\n\s*<button[\s\S]*?<\/button>\r?\n\s*<\/div>\r?\n\s*<\/aside>/, '</div>\n        </aside>');

// 2. Make the header ALWAYS visible on desktop. 
// Change: className={`flex items-center justify-between h-16 px-4 border-b bg-card ${isSidebarCollapsed ? 'flex' : 'lg:hidden'}`}
// To: className="flex items-center justify-between h-16 px-4 border-b bg-card"
c = c.replace(/<header className=\{\`flex items-center justify-between h-16 px-4 border-b bg-card \$\{isSidebarCollapsed \? 'flex' : 'lg:hidden'\}\`\}>/, 
'<header className="flex items-center justify-between h-16 px-4 border-b bg-card">');

// 3. Update the Menu button onClick to toggle the sidebar properly on desktop AND mobile
// Change: onClick={() => { setSidebarOpen(true); setIsSidebarCollapsed(false); localStorage.setItem('gympro_sidebar_collapsed', 'false'); }}
// To: onClick={() => { if (window.innerWidth < 1024) { setSidebarOpen(true); } else { toggleSidebarCollapse(); } }}
// But wait, toggleSidebarCollapse is defined in the component.
c = c.replace(/onClick=\{\(\) => \{ setSidebarOpen\(true\); setIsSidebarCollapsed\(false\); localStorage\.setItem\('gympro_sidebar_collapsed', 'false'\); \}\}/, 
`onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setSidebarOpen(true);
                  } else {
                    toggleSidebarCollapse();
                  }
                }}`);

// 4. On desktop, when the sidebar is OPEN, we already have LogoComponent in the sidebar. 
// If the Header is always visible, we'll have TWO logos visible at the same time (one in sidebar, one in header).
// We should hide the LogoComponent in the header IF the sidebar is open on desktop!
// But wait, the header logo is inside the header:
// <header className="...">
//   <LogoComponent />
// Change to:
//   <div className={`transition-opacity ${!isSidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
//     <LogoComponent />
//   </div>
c = c.replace(/<header className="flex items-center justify-between h-16 px-4 border-b bg-card">\r?\n\s*<LogoComponent \/>/,
`<header className="flex items-center justify-between h-16 px-4 border-b bg-card">
            <div className={!isSidebarCollapsed ? "lg:hidden" : ""}>
              <LogoComponent />
            </div>`);

// 5. Actually, wait. It's better to just put the hamburger menu next to the logo, or on the left side of the header.
// Currently the header is:
// <header>
//   <LogoComponent />
//   <div flex gap-4> (Theme, Menu)
// If the menu is on the right, it's weird to toggle a left sidebar.
// Let's reorganize the header:
// <header>
//   <div flex items-center gap-4>
//      <Menu button />
//      <LogoComponent (hidden if sidebar open on desktop) />
//   </div>
//   <div flex items-center gap-4> (Theme, User Profile, etc)
// </header>

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("Updated header logic");
