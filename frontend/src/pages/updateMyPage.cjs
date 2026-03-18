const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'MyPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace global layout colors
content = content.replace(/background:\s*'#0d1a14'/g, "background: '#f8faf9'"); // max-h main wrapper
content = content.replace(/fill="#0d1a14"/g, 'fill="#f8faf9"'); // SVG bottom wave
content = content.replace(/background:\s*'#111e18'/g, "background: '#ffffff'"); // Card backgrounds
content = content.replace(/linear-gradient\(135deg, #0d1a14 0%, #111e18 50%, #1a2b22 100%\)/g, "linear-gradient(135deg, #E8F4F0 0%, #F8FAF9 50%, #FFFFFF 100%)"); // Hero background
content = content.replace(/linear-gradient\(135deg, #1e3028 0%, #2D6A4F 100%\)/g, "linear-gradient(135deg, #f8faf9 0%, #e2e8e4 100%)"); // Avatar background 
content = content.replace(/rgba\(13,26,20,0\.92\)/g, "rgba(255,255,255,0.92)"); // TabBar BG
content = content.replace(/text-white/g, "text-[#1A2B27]"); // Titles

// Replace alpha channels of white to dark green
content = content.replace(/rgba\(255,255,255,/g, "rgba(26,43,39,");
// Specific texts that use '#fff' inline style instead of text-white
content = content.replace(/color:\s*'#fff'/g, "color: '#1A2B27'");

// Specific border mapping over cards
content = content.replace(/rgba\(26,43,39,0\.07\)/g, "rgba(26,43,39,0.08)"); 
content = content.replace(/rgba\(26,43,39,0\.06\)/g, "rgba(26,43,39,0.06)");

// Add Router tools + openAuth check
content = content.replace(/export function MyPage\(\) \{/g, `import { useNavigate } from 'react-router-dom';\nimport { useEffect } from 'react';\n\nexport function MyPage({ openAuth }: { openAuth: (mode: 'login' | 'signup') => void }) {\n  const navigate = useNavigate();\n  \n  useEffect(() => {\n    const token = localStorage.getItem('accessToken');\n    if (!token || token === 'undefined') {\n      navigate('/');\n      openAuth('login');\n    }\n  }, [navigate, openAuth]);\n`);

fs.writeFileSync(filePath, content);
console.log("SUCCESS!");
