const fs = require('fs');
let c = fs.readFileSync('components/layout/app-layout.tsx', 'utf8');

// 1. Fix the aside classes so it uses lg:translate-x-0 when open, and properly shrinks to w-0 when collapsed.
// The sidebarOpen is for mobile. isSidebarCollapsed is for desktop toggle.
c = c.replace(/<aside className=\{`print:hidden fixed inset-y-0 left-0 z-50 bg-card border-r transition-all duration-300 ease-in-out lg:static \$\{sidebarOpen \? "translate-x-0" : "-translate-x-full"\} \$\{isSidebarCollapsed \? "w-20" : "w-64"\}`\}/,
`<aside className={\`print:hidden fixed inset-y-0 left-0 z-50 bg-card border-r transition-all duration-300 ease-in-out \${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 \${isSidebarCollapsed ? "w-0 overflow-hidden border-none" : "w-64 lg:static"}\`}`);

// 2. We need a way to open it when it's w-0. We can add a floating hamburger button on desktop, OR show the mobile header on desktop when collapsed.
// Let's modify the mobile header to also show on desktop if sidebar is collapsed.
c = c.replace(/<header className="lg:hidden flex items-center justify-between h-16 px-4 border-b bg-card">/,
`<header className={\`flex items-center justify-between h-16 px-4 border-b bg-card \${isSidebarCollapsed ? 'flex' : 'lg:hidden'}\`}>`);

// 3. Make sure the toggle button in the header toggles isSidebarCollapsed on desktop, and sidebarOpen on mobile.
// Wait, the header has a button that sets sidebarOpen(true). On desktop, clicking it should setIsSidebarCollapsed(false).
c = c.replace(/onClick=\{\(\) => setSidebarOpen\(true\)\}/, `onClick={() => { setSidebarOpen(true); setIsSidebarCollapsed(false); localStorage.setItem('gympro_sidebar_collapsed', 'false'); }}`);

fs.writeFileSync('components/layout/app-layout.tsx', c, 'utf8');
console.log("Fixed sidebar hide/show logic");
