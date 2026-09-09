const fs = require('fs');
let c = fs.readFileSync('components/dashboards/athlete-dashboard.tsx', 'utf8');

if (!c.includes('cancelTransaction')) {
  c = c.replace(/import \{ QRCodeSVG \} from "qrcode\.react"\r?\n/, 'import { QRCodeSVG } from "qrcode.react"\nimport { cancelTransaction } from "@/app/actions/store"\nimport Swal from "sweetalert2"\n');
  c = c.replace(/const \[showTicketModal, setShowTicketModal\] = useState<Transaction \| null>\(null\)/, `const [showTicketModal, setShowTicketModal] = useState<Transaction | null>(null)\n  const [currentPage, setCurrentPage] = useState(1)\n  const itemsPerPage = 3`);
  
  c = c.replace(/\{purchases\.map\(tx => \(/, `{purchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(tx => (`);
}

fs.writeFileSync('components/dashboards/athlete-dashboard.tsx', c, 'utf8');
