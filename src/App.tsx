import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe, Play, Menu, X, RefreshCw, Trophy, ChevronDown, ChevronUp,
  ChevronRight, Check, Star, Users, TrendingUp, Shield, AlertTriangle,
  Award, RotateCcw, Building2, Package, Cpu, MapPin, DollarSign,
  ArrowRight, Clock, Zap, BarChart3, BookOpen, Handshake, Factory,
  GraduationCap, ExternalLink, Target, Layers, Link2
} from "lucide-react";
import { io } from 'socket.io-client';
import QRCode from "react-qr-code";

const socket = io('http://localhost:3001');

// ─── TYPES ────────────────────────────────────────────────────────────────────
type ThemeName = "blue" | "emerald" | "orange" | "lavender";
interface Theme { primary: string; accent: string; light: string; name: string; }
interface GameCard { id: number; pairId: number; type: "event" | "year"; content: string; flipped: boolean; matched: boolean; }

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const THEMES: Record<ThemeName, Theme> = {
  blue:     { primary: "#2563EB", accent: "#14B8A6", light: "#EFF6FF", name: "Ocean Blue" },
  emerald:  { primary: "#059669", accent: "#0EA5E9", light: "#ECFDF5", name: "Emerald"    },
  orange:   { primary: "#EA580C", accent: "#F59E0B", light: "#FFF7ED", name: "Sunset"     },
  lavender: { primary: "#7C3AED", accent: "#EC4899", light: "#F5F3FF", name: "Lavender"   },
};

const NAV_LINKS = [
  { id: "home",      label: "Home"      },
  { id: "khai-niem", label: "Khái niệm" },
  { id: "noi-dung",  label: "Nội dung"  },
  { id: "tac-dong",  label: "Tác động"  },
  { id: "phuong-huong", label: "Phương hướng" },
  { id: "vi-du",     label: "Ví dụ"     },
  { id: "timeline",  label: "Timeline"  },
  { id: "video",     label: "Video"     },
  { id: "quiz",      label: "Quiz"      },
  { id: "mini-game", label: "Mini Game" },
  { id: "nguon",     label: "Nguồn"     },
];

const TIMELINE_DATA = [
  { year: "1986", event: "Đổi Mới", desc: "Đại hội Đảng VI khởi xướng Đổi Mới — bước ngoặt lịch sử chuyển từ kinh tế kế hoạch hóa sang kinh tế thị trường định hướng XHCN. Mở cửa với thế giới.", color: "#10B981", badge: "Khởi đầu" },
  { year: "1995", event: "Gia nhập ASEAN", desc: "Việt Nam trở thành thành viên thứ 7 của ASEAN ngày 28/7/1995, bình thường hóa quan hệ với Hoa Kỳ, mở ra kỷ nguyên hội nhập khu vực.", color: "#3B82F6", badge: "Khu vực" },
  { year: "1998", event: "Gia nhập APEC", desc: "Tham gia Diễn đàn Hợp tác Kinh tế Châu Á - Thái Bình Dương — tiếp cận 21 nền kinh tế chiếm 60% GDP toàn cầu.", color: "#8B5CF6", badge: "Châu Á TBD" },
  { year: "2007", event: "Gia nhập WTO", desc: "Sau 11 năm đàm phán, Việt Nam chính thức là thành viên thứ 150 của WTO từ 11/1/2007. Mở cửa thị trường toàn diện, cam kết cải cách sâu rộng.", color: "#EC4899", badge: "Toàn cầu" },
  { year: "2018", event: "Ký kết CPTPP", desc: "Hiệp định Đối tác Toàn diện và Tiến bộ xuyên Thái Bình Dương gồm 11 quốc gia, GDP ~13.5 nghìn tỷ USD, xóa bỏ 95% dòng thuế.", color: "#F59E0B", badge: "Thế hệ mới" },
  { year: "2020", event: "EVFTA có hiệu lực", desc: "EVFTA nối Việt Nam với 27 quốc gia EU và 450 triệu người tiêu dùng từ 1/8/2020 — \"con đường tơ lụa\" của thế kỷ 21.", color: "#06B6D4", badge: "EU" },
  { year: "2022", event: "RCEP có hiệu lực", desc: "Hiệp định Đối tác Kinh tế Toàn diện Khu vực kết nối 15 nền kinh tế, chiếm 30% GDP và 30% dân số toàn cầu — hiệp định thương mại lớn nhất lịch sử.", color: "#14B8A6", badge: "Mới nhất" },
];

const INTEGRATION_FORMS = [
  { abbr: "PTA", name: "Khu vực Thương mại Ưu đãi", english: "Preferential Trade Area", level: 1, description: "Hình thức hội nhập cơ bản nhất. Các quốc gia thành viên dành cho nhau ưu đãi thuế quan có chọn lọc trên một số mặt hàng, nhưng vẫn duy trì chính sách thương mại riêng với bên ngoài khối.", features: ["Giảm thuế có chọn lọc trên một số mặt hàng", "Vẫn giữ hàng rào phi thuế quan", "Mức độ ràng buộc thấp nhất", "Ví dụ: GSP (Hệ thống ưu đãi phổ cập)"], color: "#DBEAFE", border: "#93C5FD", text: "#1E40AF" },
  { abbr: "FTA", name: "Khu vực Mậu dịch Tự do", english: "Free Trade Area", level: 2, description: "Xóa bỏ thuế quan và hàng rào phi thuế quan trong nội khối. Mỗi thành viên vẫn duy trì chính sách thương mại riêng đối với các nước không phải thành viên.", features: ["Xóa bỏ thuế quan nội khối", "Tự do thương mại hàng hóa và dịch vụ", "Chính sách thương mại riêng với bên ngoài", "Ví dụ: AFTA, EVFTA, CPTPP, VKFTA"], color: "#D1FAE5", border: "#6EE7B7", text: "#065F46" },
  { abbr: "CU", name: "Liên minh Thuế quan", english: "Customs Union", level: 3, description: "Bổ sung thêm biểu thuế quan chung thống nhất (CET) với bên ngoài khối. Các thành viên không thể đàm phán FTA riêng với đối tác bên ngoài.", features: ["Xóa bỏ thuế quan nội khối", "Thuế quan ngoại chung (CET)", "Chính sách thương mại thống nhất với bên ngoài", "Ví dụ: Liên minh Hải quan Nga-Belarus-Kazakhstan"], color: "#EDE9FE", border: "#C4B5FD", text: "#5B21B6" },
  { abbr: "CM", name: "Thị trường Chung", english: "Common Market", level: 4, description: "Bổ sung quyền tự do di chuyển của 4 yếu tố sản xuất: hàng hóa, dịch vụ, lao động và vốn. Tạo ra một thị trường thống nhất hoàn toàn.", features: ["Tự do di chuyển 4 yếu tố sản xuất", "Hàng hóa, dịch vụ, lao động, vốn", "Thị trường nội địa thống nhất rộng lớn", "Ví dụ: EEA (Khu vực Kinh tế Châu Âu)"], color: "#FEF3C7", border: "#FCD34D", text: "#92400E" },
  { abbr: "EMU", name: "Liên minh Kinh tế", english: "Economic Union", level: 5, description: "Hình thức hội nhập cao nhất, thống nhất chính sách kinh tế, tài chính và tiền tệ. Thường có đồng tiền chung và ngân hàng trung ương chung.", features: ["Tất cả đặc điểm của Thị trường Chung", "Đồng tiền và chính sách tiền tệ chung", "Chính sách kinh tế vĩ mô thống nhất", "Ví dụ: Liên minh Châu Âu (EU) — Eurozone"], color: "#FFE4E6", border: "#FCA5A5", text: "#9F1239" },
];

const CASE_STUDIES = [
  { company: "Samsung", country: "Hàn Quốc", flag: "🇰🇷", investment: "~20 tỷ USD", employees: "100,000+", location: "Bắc Ninh, Thái Nguyên, TP.HCM", impact: "~30% kim ngạch xuất khẩu VN", description: "Nhà đầu tư FDI lớn nhất tại Việt Nam. Chuỗi nhà máy sản xuất smartphone và linh kiện điện tử chiếm tỷ trọng khổng lồ trong tổng xuất khẩu cả nước, biến VN thành cứ điểm toàn cầu.", color: "#2563EB" },
  { company: "Intel", country: "Hoa Kỳ", flag: "🇺🇸", investment: "~1.5 tỷ USD", employees: "4,000+", location: "TP. Hồ Chí Minh (KCNC)", impact: "Nhà máy chip lớn nhất của Intel toàn cầu", description: "Nhà máy Intel Products Vietnam (IPV) tại Khu Công nghệ Cao TP.HCM là cơ sở lắp ráp và kiểm định vi mạch lớn nhất trong hệ thống toàn cầu của Intel — biểu tượng cho chuyển giao công nghệ.", color: "#0EA5E9" },
  { company: "LG", country: "Hàn Quốc", flag: "🇰🇷", investment: "~4 tỷ USD", employees: "40,000+", location: "Hải Phòng", impact: "Trung tâm R&D và sản xuất điện tử ĐNA", description: "LG Electronics chọn Hải Phòng làm trung tâm sản xuất TV, thiết bị điện tử và trung tâm R&D cho khu vực Đông Nam Á, tận dụng ưu đãi từ VKFTA và RCEP.", color: "#A855F7" },
  { company: "Nike", country: "Hoa Kỳ", flag: "🇺🇸", investment: "Gián tiếp — chuỗi cung ứng", employees: "500,000+ (qua nhà cung ứng)", location: "TP.HCM, Đồng Nai, Bình Dương", impact: "~50% giày Nike toàn cầu sản xuất tại VN", description: "Sau EVFTA và CPTPP, Việt Nam vươn lên trở thành trung tâm sản xuất giày thể thao Nike lớn nhất thế giới, thay thế Trung Quốc — kết quả trực tiếp của hội nhập kinh tế.", color: "#F97316" },
];

const POSITIVE_IMPACTS = [
  { title: "Mở rộng thị trường, thu hút vốn, công nghệ", desc: "Chuyển dịch cơ cấu kinh tế theo hướng hiện đại, hình thành các ngành mũi nhọn, cải thiện môi trường đầu tư kinh doanh.", icon: "📈" },
  { title: "Nâng cao chất lượng nhân lực, khoa học", desc: "Tăng khả năng tiếp thu công nghệ mới thông qua đầu tư trực tiếp nước ngoài và hợp tác giáo dục.", icon: "🧠" },
  { title: "Thúc đẩy hội nhập văn hóa, chính trị", desc: "Tiếp thu tinh hoa nhân loại, cải cách nhà nước pháp quyền, duy trì hòa bình và giải quyết vấn đề toàn cầu.", icon: "🕊️" },
  { title: "Cải thiện tiêu dùng", desc: "Người dân được thụ hưởng hàng hóa, dịch vụ đa dạng, chất lượng cao với giá cạnh tranh.", icon: "🛍️" },
];

const NEGATIVE_IMPACTS = [
  { title: "Gia tăng cạnh tranh gay gắt", desc: "Có thể khiến nhiều doanh nghiệp và ngành kinh tế trong nước gặp khó khăn, thậm chí phá sản.", icon: "⚠️" },
  { title: "Gia tăng sự phụ thuộc", desc: "Nền kinh tế dễ bị tổn thương trước các biến động về chính trị, kinh tế và thị trường thế giới.", icon: "🔗" },
  { title: "Bất bình đẳng xã hội", desc: "Phân phối lợi ích và rủi ro không công bằng có thể làm tăng khoảng cách giàu - nghèo.", icon: "⚖️" },
  { title: "Nguy cơ tụt hậu và ô nhiễm", desc: "Biến quốc gia thành 'bãi thải công nghiệp' với công nghệ thấp, cạn kiệt tài nguyên và hủy hoại môi trường.", icon: "🌿" },
  { title: "Thách thức an ninh, văn hóa", desc: "Đe dọa chủ quyền quốc gia, gia tăng tội phạm xuyên quốc gia, xói mòn bản sắc văn hóa truyền thống.", icon: "🛡️" },
];

const QUIZ_QUESTIONS = [
  { q: "Năm nào Việt Nam chính thức gia nhập ASEAN?", opts: ["1990", "1995", "2000", "2003"], ans: 1, exp: "Việt Nam gia nhập ASEAN ngày 28/7/1995, trở thành thành viên thứ 7 của tổ chức khu vực này." },
  { q: "CPTPP là viết tắt của hiệp định nào?", opts: ["Comprehensive and Progressive Agreement for Trans-Pacific Partnership", "Central Pacific Trade Program Partnership", "Cooperative Progressive Trans-Pacific Protocol", "Common Pacific Trade and Progress Program"], ans: 0, exp: "CPTPP = Hiệp định Đối tác Toàn diện và Tiến bộ xuyên Thái Bình Dương, ký năm 2018 với 11 quốc gia." },
  { q: "Năm nào Việt Nam chính thức gia nhập WTO?", opts: ["2003", "2005", "2007", "2010"], ans: 2, exp: "VN là thành viên thứ 150 của WTO từ 11/1/2007, sau 11 năm đàm phán cam go." },
  { q: "EVFTA là hiệp định thương mại tự do giữa Việt Nam và đối tác nào?", opts: ["ASEAN", "Liên minh Châu Âu (EU)", "Hoa Kỳ", "Nhật Bản"], ans: 1, exp: "EVFTA = EU-Vietnam FTA, có hiệu lực 1/8/2020, kết nối VN với 27 nước EU và 450 triệu người tiêu dùng." },
  { q: 'Chính sách "Đổi Mới" khởi xướng năm nào?', opts: ["1975", "1980", "1986", "1990"], ans: 2, exp: "Đổi Mới được Đại hội Đảng VI khởi xướng năm 1986, đổi mới toàn diện tư duy kinh tế." },
  { q: "FDI là viết tắt của thuật ngữ nào?", opts: ["Foreign Direct Investment", "Free Development Initiative", "Financial Development Index", "Federal Direct Income"], ans: 0, exp: "FDI = Đầu tư Trực tiếp Nước ngoài (Foreign Direct Investment) — nguồn vốn quan trọng nhất sau hội nhập." },
  { q: "Hình thức hội nhập kinh tế cao nhất là?", opts: ["FTA (Mậu dịch tự do)", "Liên minh thuế quan (CU)", "Thị trường chung (CM)", "Liên minh kinh tế (EMU)"], ans: 3, exp: "Liên minh kinh tế (EMU) là mức độ cao nhất, thống nhất chính sách kinh tế, tài chính và tiền tệ." },
  { q: "Samsung đầu tư lớn nhất ở tỉnh nào của Việt Nam?", opts: ["Hà Nội", "TP. Hồ Chí Minh", "Bắc Ninh", "Đà Nẵng"], ans: 2, exp: "Bắc Ninh là trung tâm sản xuất smartphone Samsung lớn nhất, đóng góp phần lớn xuất khẩu điện tử VN." },
  { q: "RCEP gồm bao nhiêu quốc gia thành viên?", opts: ["10", "12", "15", "20"], ans: 2, exp: "RCEP gồm 15 quốc gia: 10 ASEAN + Trung Quốc, Nhật Bản, Hàn Quốc, Australia, New Zealand." },
  { q: "VN sản xuất khoảng bao nhiêu % giày Nike trên toàn cầu?", opts: ["20%", "35%", "50%", "65%"], ans: 2, exp: "Nhờ FTA và chi phí lao động cạnh tranh, VN sản xuất ~50% lượng giày Nike trên thế giới." },
];

const GAME_PAIRS = [
  { id: 0, event: "Đổi Mới",         year: "1986" },
  { id: 1, event: "Gia nhập ASEAN",  year: "1995" },
  { id: 2, event: "Gia nhập WTO",    year: "2007" },
  { id: 3, event: "Ký kết CPTPP",    year: "2018" },
  { id: 4, event: "EVFTA hiệu lực",  year: "2020" },
  { id: 5, event: "RCEP hiệu lực",   year: "2022" },
];

// ─── HOOK: SCROLL PROGRESS + ACTIVE SECTION ───────────────────────────────────
function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
      let found = "home";
      for (const { id } of NAV_LINKS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 80) found = id;
      }
      setActiveSection(found);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { progress, activeSection };
}

// ─── UTILITY: SCROLL TO ────────────────────────────────────────────────────────
const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

// ─── WORLD MAP SVG ─────────────────────────────────────────────────────────────
function WorldMapSVG({ primaryColor }: { primaryColor: string }) {
  const vn = { x: 768, y: 258 };
  const partners = [
    { name: "Japan",     x: 852, y: 192, delay: 0.0 },
    { name: "Korea",     x: 836, y: 207, delay: 0.4 },
    { name: "China",     x: 795, y: 198, delay: 0.8 },
    { name: "USA",       x: 128, y: 192, delay: 1.2 },
    { name: "EU",        x: 490, y: 130, delay: 1.6 },
    { name: "Australia", x: 848, y: 388, delay: 2.0 },
    { name: "Singapore", x: 778, y: 295, delay: 2.4 },
  ];

  return (
    <svg viewBox="0 0 940 480" className="w-full h-full" role="img" aria-label="World map showing Vietnam and key trading partners">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#EFF6FF" />
          <stop offset="100%" stopColor="#DBEAFE" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="940" height="480" fill="url(#bgGrad)" rx="20" />

      {/* Grid lines */}
      <g stroke="#BFDBFE" strokeWidth="0.5" opacity="0.5">
        {[96, 144, 192, 240, 288, 336, 384].map(y => <line key={y} x1="0" y1={y} x2="940" y2={y} />)}
        {[94, 188, 282, 376, 470, 564, 658, 752, 846].map(x => <line key={x} x1={x} y1="0" x2={x} y2="480" />)}
      </g>

      {/* Continent shapes */}
      <g fill="#BFDBFE" stroke="#93C5FD" strokeWidth="0.7" opacity="0.65">
        {/* North America */}
        <path d="M 62,88 C 105,65 180,62 258,76 L 298,84 C 322,94 334,124 324,150 L 304,180 L 265,204 L 208,224 L 150,230 C 120,230 90,214 70,194 L 54,160 L 54,114 Z" />
        {/* Greenland */}
        <ellipse cx="295" cy="60" rx="38" ry="22" />
        {/* South America */}
        <path d="M 200,230 C 234,220 304,220 340,240 L 354,270 L 344,360 L 304,414 L 260,420 C 228,414 200,394 190,370 L 180,310 L 188,264 Z" />
        {/* Europe */}
        <path d="M 450,100 C 470,90 530,86 560,94 L 580,114 L 574,144 L 549,170 C 529,180 492,177 468,162 L 450,142 L 448,120 Z" />
        {/* UK */}
        <ellipse cx="475" cy="108" rx="10" ry="18" transform="rotate(-10 475 108)" />
        {/* Africa */}
        <path d="M 452,184 C 476,174 562,172 602,186 L 620,220 L 614,324 L 594,384 L 544,414 L 492,410 L 454,380 L 436,310 L 436,234 Z" />
        {/* Asia mainland */}
        <path d="M 580,94 C 655,80 805,74 890,90 L 910,144 L 894,244 L 854,310 L 804,340 L 754,320 L 714,294 L 663,274 L 623,244 L 593,204 L 573,160 L 568,124 Z" />
        {/* Indian sub */}
        <path d="M 662,274 C 688,258 724,255 744,268 L 744,314 L 712,338 L 670,334 L 650,308 Z" />
        {/* Australia */}
        <path d="M 756,354 C 790,342 870,340 900,354 L 910,396 L 880,434 L 824,444 L 768,430 L 752,404 Z" />
        {/* Japan */}
        <ellipse cx="860" cy="196" rx="13" ry="26" transform="rotate(-20 860 196)" />
        {/* Korean peninsula */}
        <ellipse cx="840" cy="214" rx="8" ry="16" />
        {/* New Zealand */}
        <ellipse cx="900" cy="438" rx="6" ry="14" transform="rotate(-30 900 438)" />
      </g>

      {/* Connection lines */}
      {partners.map((p) => (
        <motion.path
          key={p.name}
          d={`M ${vn.x},${vn.y} L ${p.x},${p.y}`}
          stroke={primaryColor}
          strokeWidth="1.8"
          strokeDasharray="6 5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.75, 0.75, 0] }}
          transition={{
            duration: 3.5,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: partners.length * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Partner dots */}
      {partners.map((p, i) => (
        <motion.g
          key={p.name}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + i * 0.15 }}
        >
          <circle cx={p.x} cy={p.y} r="6" fill={primaryColor} opacity="0.6" />
          <circle cx={p.x} cy={p.y} r="3" fill="white" />
          <text
            x={p.x}
            y={p.y - 12}
            textAnchor="middle"
            fontSize="10"
            fill="#475569"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="500"
          >
            {p.name}
          </text>
        </motion.g>
      ))}

      {/* Vietnam — highlighted */}
      <motion.circle
        cx={vn.x} cy={vn.y} r="8"
        fill={primaryColor}
        opacity="0.15"
        animate={{ r: [8, 28, 8], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
      />
      <circle cx={vn.x} cy={vn.y} r="9" fill={primaryColor} opacity="0.2" />
      <circle cx={vn.x} cy={vn.y} r="6" fill={primaryColor} filter="url(#glow)" />
      <circle cx={vn.x} cy={vn.y} r="3" fill="white" />
      <text
        x={vn.x}
        y={vn.y + 22}
        textAnchor="middle"
        fontSize="12"
        fill="#1E40AF"
        fontFamily="'JetBrains Mono', monospace"
        fontWeight="600"
      >
        Việt Nam
      </text>
    </svg>
  );
}

// ─── SECTION HEADER ────────────────────────────────────────────────────────────
function SectionHeader({
  label, title, subtitle, primaryColor,
}: { label: string; title: string; subtitle?: string; primaryColor: string }) {
  return (
    <motion.div
      className="text-center mb-16"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
    >
      <span
        className="inline-block text-xs font-mono font-semibold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full mb-5"
        style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}
      >
        {label}
      </span>
      <h2
        className="text-4xl lg:text-[52px] font-bold tracking-tight text-slate-900 mb-5 leading-tight"
        style={{ fontFamily: "'Newsreader', Georgia, serif" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  );
}

// ─── NAVBAR ────────────────────────────────────────────────────────────────────
function Navbar({
  activeSection, progress, theme, setTheme, primaryColor,
}: {
  activeSection: string;
  progress: number;
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  primaryColor: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-xl border-b border-black/[0.06] shadow-sm" : "bg-transparent"
      }`}
    >
      {/* Scroll progress */}
      <div
        className="absolute top-0 left-0 h-[3px] transition-all duration-150 rounded-r-full"
        style={{ width: `${progress}%`, backgroundColor: primaryColor }}
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => scrollTo("home")}
          className="flex items-center gap-2 shrink-0"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: primaryColor }}>
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm hidden sm:block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            VN · Hội nhập
          </span>
        </button>

        {/* Nav links */}
        <div className="hidden xl:flex items-center gap-0.5">
          {NAV_LINKS.map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150"
              style={
                activeSection === link.id
                  ? { backgroundColor: primaryColor, color: "white" }
                  : { color: "#475569" }
              }
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Theme switcher + mobile */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur px-2 py-1.5 rounded-full border border-black/[0.06]">
            {(Object.entries(THEMES) as [ThemeName, Theme][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                title={val.name}
                className="w-5 h-5 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: val.primary,
                  outline: theme === key ? `2px solid ${val.primary}` : "none",
                  outlineOffset: "2px",
                  transform: theme === key ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>
          <button
            className="xl:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-white/95 backdrop-blur-xl border-b border-black/[0.06] overflow-hidden"
          >
            <div className="px-4 py-3 grid grid-cols-2 gap-1">
              {NAV_LINKS.map(link => (
                <button
                  key={link.id}
                  onClick={() => { scrollTo(link.id); setMobileOpen(false); }}
                  className="text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── HERO SECTION ──────────────────────────────────────────────────────────────
function HeroSection({ primaryColor, accentColor }: { primaryColor: string; accentColor: string }) {
  const [visitors, setVisitors] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [quizDone, setQuizDone] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    socket.on('stats', (data) => {
      setVisitors(data.activeUsers);
      setTotalVisits(data.totalVisits);
      setQuizDone(data.quizCompleted);
    });
    return () => {
      socket.off('stats');
    };
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-16 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-10 blur-[120px]"
          style={{ backgroundColor: primaryColor }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-8 blur-[100px]"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold tracking-widest uppercase mb-6 border"
              style={{ color: primaryColor, backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}25` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              Bài giảng kinh tế quốc tế · 2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl lg:text-6xl xl:text-[68px] font-bold tracking-tight text-slate-900 leading-[1.08] mb-6"
              style={{ fontFamily: "'Newsreader', Georgia, serif" }}
            >
              Hội nhập<br />
              <span style={{ color: primaryColor }}>Kinh tế</span><br />
              Quốc tế
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-500 leading-relaxed mb-8 max-w-xl"
            >
              Hành trình của Việt Nam từ Đổi Mới 1986 đến siêu cường thương mại khu vực — nghiên cứu toàn diện về hội nhập kinh tế quốc tế.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <button
                onClick={() => scrollTo("khai-niem")}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                style={{ backgroundColor: primaryColor }}
              >
                <ArrowRight className="w-4 h-4" />
                Khám phá
              </button>
              <button
                onClick={() => scrollTo("quiz")}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold border-2 hover:-translate-y-0.5 transition-all duration-200 bg-white"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <GraduationCap className="w-4 h-4" />
                Làm Quiz
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-5"
            >
              {[
                { label: "Đang xem", value: visitors.toLocaleString(), icon: "🟢" },
                { label: "Lượt truy cập", value: totalVisits.toLocaleString(), icon: "📊" },
                { label: "Quiz hoàn thành", value: quizDone.toLocaleString(), icon: "🎯" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-base">{s.icon}</span>
                  <div>
                    <div className="text-xs text-slate-400 font-mono">{s.label}</div>
                    <div className="text-base font-bold text-slate-800 font-mono">{s.value}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: World map + QR */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="rounded-[20px] overflow-hidden shadow-2xl border border-white/80 bg-white aspect-[940/480]"
              style={{ boxShadow: `0 32px 80px ${primaryColor}20` }}
            >
              <WorldMapSVG primaryColor={primaryColor} />
            </motion.div>

            {/* QR + Caption */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-black/[0.06] shadow-sm"
            >
              {/* Real QR */}
              <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-white flex items-center justify-center border border-slate-100">
                <QRCode value={window.location.href} size={48} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">Chia sẻ tài liệu</div>
                <div className="text-xs text-slate-400 font-mono">Quét QR để truy cập nhanh</div>
              </div>
              <div className="ml-auto text-xs font-mono px-2 py-1 rounded-full" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                ⭐ Premium
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-xs text-slate-400 font-mono tracking-widest uppercase">Cuộn xuống</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── CONCEPT SECTION ───────────────────────────────────────────────────────────
function ConceptSection({ primaryColor, accentColor }: { primaryColor: string; accentColor: string }) {
  const concepts = [
    { icon: "🤝", title: "Hợp tác", desc: "Các quốc gia hợp tác kinh tế trên nguyên tắc bình đẳng, cùng có lợi." },
    { icon: "🌐", title: "Toàn cầu hóa", desc: "Gắn kết thị trường quốc gia vào hệ thống kinh tế toàn cầu." },
    { icon: "📋", title: "Cam kết", desc: "Ký kết và thực thi các hiệp định thương mại, đầu tư quốc tế." },
    { icon: "⚡", title: "Tự do hóa", desc: "Dỡ bỏ rào cản thương mại, tự do di chuyển hàng hóa, vốn, lao động." },
    { icon: "🔗", title: "Liên kết", desc: "Chuỗi cung ứng toàn cầu kết nối sản xuất nhiều quốc gia." },
    { icon: "📈", title: "Phát triển", desc: "Tối ưu hóa lợi thế so sánh, thúc đẩy tăng trưởng bền vững." },
  ];

  return (
    <section id="khai-niem" className="py-24 px-4">
      <div className="max-w-[1200px] mx-auto">
        <SectionHeader
          label="Khái niệm · Definition"
          title="Hội nhập kinh tế quốc tế là gì?"
          subtitle="Quá trình gắn kết kinh tế quốc gia vào nền kinh tế thế giới thông qua việc tham gia các tổ chức, ký kết hiệp định và thực thi các cam kết quốc tế."
          primaryColor={primaryColor}
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Definition cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-[20px] p-8 border border-black/[0.06] shadow-sm">
              <div className="text-4xl mb-4">📖</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                Định nghĩa chính thức
              </h3>
              <p className="text-slate-600 leading-relaxed">
                <strong>Hội nhập kinh tế quốc tế</strong> của một quốc gia là quá trình quốc gia đó thực hiện gắn kết nền kinh tế của mình với nền kinh tế thế giới dựa trên sự chia sẻ lợi ích, đồng thời tuân thủ các chuẩn mực quốc tế chung.
              </p>
            </div>
            <div className="bg-white rounded-[20px] p-8 border border-black/[0.06] shadow-sm">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                Tính tất yếu khách quan
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-2.5 text-slate-600">
                  <Check className="w-4 h-4 mt-1 shrink-0" style={{ color: primaryColor }} />
                  <span className="text-sm"><strong>Xu thế khách quan của toàn cầu hóa:</strong> Tạo sự liên kết và phụ thuộc lẫn nhau, lưu thông các yếu tố sản xuất toàn cầu. Nếu không hội nhập sẽ không thể tự đảm bảo điều kiện sản xuất.</span>
                </li>
                <li className="flex items-start gap-2.5 text-slate-600">
                  <Check className="w-4 h-4 mt-1 shrink-0" style={{ color: primaryColor }} />
                  <span className="text-sm"><strong>Phương thức phát triển phổ biến:</strong> Giúp các nước đang phát triển tiếp cận nguồn lực (tài chính, KH-CN, kinh nghiệm), mở cửa thị trường, tạo việc làm và rút ngắn khoảng cách với các nước tiên tiến.</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Right: Infographic */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="rounded-[20px] overflow-hidden border border-black/[0.06] shadow-sm bg-white p-6">
              <div className="text-sm font-mono font-semibold text-slate-400 tracking-widest uppercase mb-6">
                Các trụ cột hội nhập
              </div>
              <div className="grid grid-cols-2 gap-3">
                {concepts.map((c, i) => (
                  <motion.div
                    key={c.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -3, boxShadow: `0 8px 32px ${primaryColor}18` }}
                    className="p-4 rounded-2xl border border-black/[0.06] bg-slate-50/50 cursor-default transition-all duration-200"
                  >
                    <div className="text-2xl mb-2">{c.icon}</div>
                    <div className="text-sm font-semibold text-slate-800 mb-1">{c.title}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{c.desc}</div>
                  </motion.div>
                ))}
              </div>

              {/* Image attribution */}
              <div className="mt-4 pt-4 border-t border-black/[0.06]">
                <p className="text-xs text-slate-400 font-mono">
                  Infographic tổng hợp từ: Bộ Công Thương VN, WTO, UNCTAD · 2024
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── CONTENT SECTION (Forms of Integration) ───────────────────────────────────
function ContentSection({ primaryColor }: { primaryColor: string }) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <section id="noi-dung" className="py-24 px-4 bg-slate-900">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="inline-block text-xs font-mono font-semibold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full mb-5 bg-white/10 text-white"
          >
            Nội dung · Forms of Integration
          </span>
          <h2
            className="text-4xl lg:text-[52px] font-bold tracking-tight text-white mb-5 leading-tight"
            style={{ fontFamily: "'Newsreader', Georgia, serif" }}
          >
            Các hình thức hội nhập
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Từ việc chuẩn bị các điều kiện trong nước đến việc tham gia các cấp độ hội nhập với mức độ cam kết ngày càng sâu.
          </p>
        </motion.div>

        {/* Preparation block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-12 max-w-3xl mx-auto backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Chuẩn bị đầy đủ điều kiện</h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Để hội nhập thành công, cần chuẩn bị sẵn sàng về <strong>tư duy, sự tham gia của toàn xã hội, sự hoàn thiện của thể chế, nguồn nhân lực</strong> và <strong>năng lực sản xuất thực</strong> của nền kinh tế.
          </p>
        </motion.div>

        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-white mb-2">Đa dạng các hình thức và mức độ</h3>
          <p className="text-slate-400 text-sm">Tiến trình hội nhập chia thành các mức độ cơ bản từ thấp đến cao.</p>
        </div>

        {/* Pyramid visual */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.9 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-center gap-2 mb-12 h-24"
        >
          {INTEGRATION_FORMS.map((f, i) => (
            <button
              key={f.abbr}
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex-1 max-w-[160px] flex items-end justify-center pb-2 rounded-t-lg transition-all duration-200 relative"
              style={{
                height: `${40 + i * 16}px`,
                backgroundColor: expanded === i ? primaryColor : f.color,
                color: expanded === i ? "white" : f.text,
                border: `2px solid ${expanded === i ? primaryColor : f.border}`,
              }}
            >
              <span className="text-xs font-bold font-mono">{f.abbr}</span>
              {i === INTEGRATION_FORMS.length - 1 && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">⭐</span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Expandable cards */}
        <div className="space-y-3">
          {INTEGRATION_FORMS.map((form, i) => (
            <motion.div
              key={form.abbr}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-[20px] overflow-hidden border"
              style={{ borderColor: expanded === i ? form.border : "rgba(255,255,255,0.1)", backgroundColor: expanded === i ? "white" : "rgba(255,255,255,0.05)" }}
            >
              <button
                className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="px-3 py-1 rounded-lg text-sm font-bold font-mono"
                    style={{ backgroundColor: form.color, color: form.text }}
                  >
                    Cấp {form.level} · {form.abbr}
                  </span>
                  <div>
                    <div className="font-semibold text-white text-sm" style={{ color: expanded === i ? "#0F172A" : "white" }}>
                      {form.name}
                    </div>
                    <div className="text-xs font-mono" style={{ color: expanded === i ? "#64748B" : "#94A3B8" }}>
                      {form.english}
                    </div>
                  </div>
                </div>
                {expanded === i
                  ? <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" />
                  : <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />}
              </button>
              <AnimatePresence>
                {expanded === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-slate-600 text-sm leading-relaxed">{form.description}</p>
                      </div>
                      <div className="space-y-2">
                        {form.features.map(feat => (
                          <div key={feat} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: form.text }} />
                            <span className="text-xs text-slate-600">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── IMPACT SECTION ────────────────────────────────────────────────────────────
function ImpactSection({ primaryColor }: { primaryColor: string }) {
  return (
    <section id="tac-dong" className="py-24 px-4">
      <div className="max-w-[1200px] mx-auto">
        <SectionHeader
          label="Tác động · Impact"
          title="Hội nhập tác động thế nào?"
          subtitle="Hội nhập kinh tế quốc tế mang lại cơ hội lớn nhưng cũng đặt ra không ít thách thức cho Việt Nam."
          primaryColor={primaryColor}
        />

        <div className="grid md:grid-cols-2 gap-8">
          {/* Positive */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-[20px] overflow-hidden border border-black/[0.06] shadow-sm"
          >
            <div className="px-6 py-5 border-b border-black/[0.06]" style={{ backgroundColor: "#ECFDF5" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Tác động tích cực</div>
                  <div className="text-xs text-slate-500 font-mono">Positive Impacts</div>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {POSITIVE_IMPACTS.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-emerald-50/60 transition-all duration-200 cursor-default"
                >
                  <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 mb-0.5">{item.title}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Negative */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-[20px] overflow-hidden border border-black/[0.06] shadow-sm"
          >
            <div className="px-6 py-5 border-b border-black/[0.06]" style={{ backgroundColor: "#FFF7ED" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Thách thức & Rủi ro</div>
                  <div className="text-xs text-slate-500 font-mono">Negative Impacts</div>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {NEGATIVE_IMPACTS.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ x: -4 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-orange-50/60 transition-all duration-200 cursor-default"
                >
                  <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 mb-0.5">{item.title}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Key stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "GDP 2023", value: "$430B", sub: "Tỷ USD" },
            { label: "Xuất khẩu/năm", value: "355B", sub: "Tỷ USD" },
            { label: "FDI đăng ký", value: "36B+", sub: "Tỷ USD/năm" },
            { label: "Hiệp định FTA", value: "17+", sub: "Đã ký kết" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-sm text-center">
              <div className="text-2xl font-bold font-mono mb-1" style={{ color: primaryColor }}>{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
              <div className="text-xs text-slate-400 font-mono">{s.sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── DIRECTIONS SECTION ────────────────────────────────────────────────────────
function DirectionsSection({ primaryColor }: { primaryColor: string }) {
  const directions = [
    { title: "Nhận thức sâu sắc", desc: "Coi hội nhập là phương thức tồn tại tất yếu, lấy mặt tích cực làm cơ bản; coi hội nhập là sự nghiệp toàn dân, doanh nghiệp là nòng cốt." },
    { title: "Xây dựng chiến lược & lộ trình", desc: "Đánh giá bối cảnh, có chiến lược mở, linh hoạt, xác định lộ trình và ngành nghề ưu tiên hợp lý để tránh các cú sốc cho nền kinh tế." },
    { title: "Tích cực tham gia liên kết", desc: "Tham gia sâu rộng, thực hiện đầy đủ cam kết với WTO, ASEAN, APEC... tận dụng cơ chế liên kết để bảo vệ lợi ích quốc gia." },
    { title: "Hoàn thiện thể chế & pháp luật", desc: "Đổi mới quản lý, cải cách hành chính, minh bạch chính sách, rà soát luật (đất đai, đầu tư, thuế) tạo môi trường cạnh tranh bình đẳng." },
    { title: "Nâng cao năng lực cạnh tranh", desc: "Doanh nghiệp học cách cạnh tranh, đổi mới công nghệ. Nhà nước hỗ trợ hạ tầng, đào tạo nhân lực chất lượng cao." },
    { title: "Xây dựng kinh tế độc lập, tự chủ", desc: "Không lệ thuộc đường lối, kết hợp chặt chẽ kinh tế với quốc phòng, an ninh. Xử lý tốt mối quan hệ giữa độc lập, tự chủ và hội nhập." }
  ];

  return (
    <section id="phuong-huong" className="py-24 px-4 bg-slate-50">
      <div className="max-w-[1200px] mx-auto">
        <SectionHeader
          label="Phương hướng · Directions"
          title="Nâng cao hiệu quả hội nhập"
          subtitle="6 phương hướng trọng tâm để Việt Nam hội nhập thành công và bền vững."
          primaryColor={primaryColor}
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {directions.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl mb-5 flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                <span className="font-bold font-mono text-lg">{i + 1}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug">{d.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CASE STUDIES ──────────────────────────────────────────────────────────────
function CaseStudiesSection({ primaryColor }: { primaryColor: string }) {
  return (
    <section id="vi-du" className="py-24 px-4 bg-slate-50">
      <div className="max-w-[1200px] mx-auto">
        <SectionHeader
          label="Ví dụ · Case Studies"
          title="Tập đoàn quốc tế tại Việt Nam"
          subtitle="Những doanh nghiệp FDI tiêu biểu đã biến Việt Nam thành trung tâm sản xuất toàn cầu nhờ các hiệp định thương mại."
          primaryColor={primaryColor}
        />

        <div className="grid md:grid-cols-2 gap-6">
          {CASE_STUDIES.map((cs, i) => (
            <motion.div
              key={cs.company}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: `0 24px 60px ${cs.color}20` }}
              className="bg-white rounded-[20px] overflow-hidden border border-black/[0.06] shadow-sm transition-all duration-300 group"
            >
              <div className="h-2" style={{ backgroundColor: cs.color }} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{cs.flag}</span>
                      <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                        {cs.company}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{cs.country}</div>
                  </div>
                  <div
                    className="text-xs font-mono font-semibold px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: `${cs.color}15`, color: cs.color }}
                  >
                    FDI
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-5">{cs.description}</p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: DollarSign, label: "Đầu tư", value: cs.investment },
                    { icon: Users, label: "Lao động", value: cs.employees },
                    { icon: MapPin, label: "Địa điểm", value: cs.location },
                    { icon: TrendingUp, label: "Tác động", value: cs.impact },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50">
                      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                      <div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">{label}</div>
                        <div className="text-xs font-semibold text-slate-700 mt-0.5">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-slate-400 font-mono mt-8"
        >
          Nguồn: Cục Đầu tư nước ngoài (MPI), JETRO, AmCham Vietnam · Số liệu cập nhật 2024
        </motion.p>
      </div>
    </section>
  );
}

// ─── TIMELINE SECTION ──────────────────────────────────────────────────────────
function TimelineSection({ primaryColor }: { primaryColor: string }) {
  return (
    <section id="timeline" className="py-24 px-4">
      <div className="max-w-[900px] mx-auto">
        <SectionHeader
          label="Timeline · Lịch sử"
          title="Hành trình hội nhập của Việt Nam"
          subtitle="Từ cải cách Đổi Mới 1986 đến siêu cường thương mại khu vực — bốn thập kỷ mở cửa và hội nhập."
          primaryColor={primaryColor}
        />

        <div className="relative">
          {/* Center line */}
          <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-slate-200 hidden md:block" />

          <div className="space-y-8">
            {TIMELINE_DATA.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className={`relative flex items-center gap-6 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                {/* Card */}
                <div className={`w-full md:w-[calc(50%-2rem)] ${i % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                  <motion.div
                    whileHover={{ y: -4, boxShadow: `0 16px 48px ${item.color}20` }}
                    className="bg-white rounded-[20px] p-6 border border-black/[0.06] shadow-sm transition-all duration-200"
                  >
                    <div className={`flex items-center gap-3 mb-3 ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                      <div
                        className="text-xs font-mono font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${item.color}18`, color: item.color }}
                      >
                        {item.badge}
                      </div>
                      <span className="text-2xl font-bold font-mono text-slate-900">{item.year}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                      {item.event}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </motion.div>
                </div>

                {/* Center dot */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-4 border-white shadow-md items-center justify-center shrink-0 z-10"
                  style={{ backgroundColor: item.color }}>
                  <Clock className="w-4 h-4 text-white" />
                </div>

                {/* Mobile dot */}
                <div className="md:hidden w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />

                {/* Empty side */}
                <div className="hidden md:block w-[calc(50%-2rem)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── VIDEO SECTION ─────────────────────────────────────────────────────────────
function VideoSection({ primaryColor }: { primaryColor: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="video" className="py-24 px-4 bg-slate-900">
      <div className="max-w-[900px] mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-xs font-mono font-semibold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full mb-5 bg-white/10 text-white">
            Video · Tài liệu
          </span>
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
            Việt Nam và hành trình hội nhập
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Tìm hiểu thêm về quá trình mở cửa kinh tế Việt Nam qua góc nhìn chuyên gia và tư liệu lịch sử.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[20px] overflow-hidden bg-slate-800 aspect-video shadow-2xl"
          style={{ boxShadow: `0 32px 80px ${primaryColor}30` }}
        >
          {!playing ? (
            <>
              <img
                src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1280&h=720&fit=crop&auto=format"
                alt="Vietnam Ho Chi Minh City skyline - economic hub. Photo: Unsplash"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPlaying(true)}
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </motion.button>
                <div className="text-center">
                  <div className="text-white font-semibold">Vietnam Economic Integration</div>
                  <div className="text-slate-400 text-sm font-mono">CNBC · World Bank · 12:34</div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 text-xs text-white/40 font-mono">
                Ảnh: Unsplash / @saigon_photo
              </div>
            </>
          ) : (
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/NhMRsjBNnME?autoplay=1"
              title="Vietnam Economic Integration"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-slate-500 font-mono mt-6"
        >
          Video có thể thay thế bằng tài liệu nội bộ. Ảnh thumbnail: Unsplash · CC0
        </motion.p>
      </div>
    </section>
  );
}

// ─── QUIZ SECTION ──────────────────────────────────────────────────────────────
function QuizSection({ primaryColor, accentColor }: { primaryColor: string; accentColor: string }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUIZ_QUESTIONS.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const score = answers.filter((a, i) => a === QUIZ_QUESTIONS[i].ans).length;
  const q = QUIZ_QUESTIONS[current];

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
    setRevealed(true);
    setTimeout(() => {
      if (current + 1 < QUIZ_QUESTIONS.length) {
        setCurrent(c => c + 1);
        setSelected(null);
        setRevealed(false);
      } else {
        setShowResult(true);
        socket.emit('quiz_completed');
      }
    }, 1100);
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers(Array(QUIZ_QUESTIONS.length).fill(null));
    setShowResult(false);
    setRevealed(false);
  };

  const getGrade = (s: number) => {
    if (s >= 9) return { label: "Xuất sắc! 🏆", color: "#10B981", msg: "Bạn là chuyên gia về hội nhập kinh tế Việt Nam!" };
    if (s >= 7) return { label: "Giỏi! ⭐", color: "#3B82F6", msg: "Kiến thức rất tốt, chỉ còn một vài chi tiết nhỏ cần ôn." };
    if (s >= 5) return { label: "Khá! 💪", color: "#F59E0B", msg: "Nền tảng ổn, hãy ôn lại timeline và các FTA nhé!" };
    return { label: "Cần cố gắng thêm! 📚", color: "#EF4444", msg: "Đừng nản, hãy đọc lại bài và thử lại ngay!" };
  };

  return (
    <section id="quiz" className="py-24 px-4">
      <div className="max-w-[720px] mx-auto">
        <SectionHeader
          label="Quiz · Kiểm tra"
          title="Kiểm tra kiến thức"
          subtitle="10 câu hỏi về hội nhập kinh tế quốc tế của Việt Nam. Chúc bạn đạt điểm tốt!"
          primaryColor={primaryColor}
        />

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[20px] p-8 border border-black/[0.06] shadow-sm"
            >
              {/* Progress */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-mono text-slate-400">Câu {current + 1} / {QUIZ_QUESTIONS.length}</span>
                <div className="flex gap-1">
                  {QUIZ_QUESTIONS.map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: i === current ? "24px" : "8px",
                        backgroundColor:
                          answers[i] !== null
                            ? answers[i] === QUIZ_QUESTIONS[i].ans ? "#10B981" : "#EF4444"
                            : i === current ? primaryColor : "#E2E8F0",
                      }}
                    />
                  ))}
                </div>
                <div className="text-sm font-mono text-slate-400">
                  {answers.filter((a, i) => a !== null && a === QUIZ_QUESTIONS[i].ans).length} đúng
                </div>
              </div>

              <h3
                className="text-xl font-bold text-slate-900 mb-6 leading-snug"
                style={{ fontFamily: "'Newsreader', Georgia, serif" }}
              >
                {q.q}
              </h3>

              <div className="space-y-3 mb-6">
                {q.opts.map((opt, idx) => {
                  let bg = "bg-slate-50 border-slate-200 text-slate-700";
                  let icon = null;
                  if (revealed) {
                    if (idx === q.ans) { bg = "bg-emerald-50 border-emerald-400 text-emerald-800"; icon = <Check className="w-4 h-4 text-emerald-600" />; }
                    else if (idx === selected && selected !== q.ans) { bg = "bg-red-50 border-red-400 text-red-800"; icon = <X className="w-4 h-4 text-red-500" />; }
                    else { bg = "bg-slate-50 border-slate-100 text-slate-400"; }
                  } else if (idx === selected) {
                    bg = "border-2 text-slate-900";
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={!revealed ? { x: 4 } : {}}
                      whileTap={!revealed ? { scale: 0.99 } : {}}
                      onClick={() => handleSelect(idx)}
                      className={`w-full text-left p-4 rounded-2xl border text-sm font-medium flex items-center justify-between gap-3 transition-all duration-150 ${bg}`}
                      style={!revealed && idx === selected ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-6 h-6 rounded-full text-xs font-bold font-mono flex items-center justify-center shrink-0"
                          style={idx === selected && !revealed ? { backgroundColor: primaryColor, color: "white" } : { backgroundColor: "#F1F5F9", color: "#64748B" }}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {icon}
                    </motion.button>
                  );
                })}
              </div>

              {revealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-4 p-4 rounded-2xl bg-blue-50 border border-blue-100"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">💡</span>
                    <p className="text-sm text-blue-700">{q.exp}</p>
                  </div>
                </motion.div>
              )}

              <button
                onClick={handleNext}
                disabled={selected === null}
                className="w-full py-3 rounded-2xl text-white font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                style={{ backgroundColor: primaryColor }}
              >
                {current + 1 === QUIZ_QUESTIONS.length ? "Xem kết quả" : revealed ? "Câu tiếp theo →" : "Xác nhận"}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[20px] p-10 border border-black/[0.06] shadow-sm text-center"
            >
              {/* Stars */}
              <motion.div className="flex justify-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                  >
                    <Star
                      className="w-8 h-8"
                      fill={i < Math.round(score / 2) ? "#F59E0B" : "#E2E8F0"}
                      stroke={i < Math.round(score / 2) ? "#F59E0B" : "#E2E8F0"}
                    />
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <div
                  className="text-7xl font-bold font-mono mb-2"
                  style={{ color: getGrade(score).color }}
                >
                  {score}/{QUIZ_QUESTIONS.length}
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                  {getGrade(score).label}
                </div>
                <p className="text-slate-500 mb-8">{getGrade(score).msg}</p>
              </motion.div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Đúng", value: score, color: "#10B981" },
                  { label: "Sai", value: QUIZ_QUESTIONS.length - score, color: "#EF4444" },
                  { label: "Điểm %", value: `${Math.round((score / QUIZ_QUESTIONS.length) * 100)}%`, color: primaryColor },
                ].map(s => (
                  <div key={s.label} className="p-4 rounded-2xl bg-slate-50">
                    <div className="text-2xl font-bold font-mono mb-1" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={restart}
                className="flex items-center gap-2 mx-auto px-6 py-3 rounded-2xl text-white font-semibold text-sm hover:-translate-y-0.5 transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <RotateCcw className="w-4 h-4" />
                Làm lại quiz
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── MINI GAME SECTION ─────────────────────────────────────────────────────────
function MiniGameSection({ primaryColor }: { primaryColor: string }) {
  const initCards = (): GameCard[] => {
    const cards: GameCard[] = [];
    GAME_PAIRS.forEach((pair) => {
      cards.push({ id: pair.id * 2,     pairId: pair.id, type: "event", content: pair.event, flipped: false, matched: false });
      cards.push({ id: pair.id * 2 + 1, pairId: pair.id, type: "year",  content: pair.year,  flipped: false, matched: false });
    });
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  };

  const [cards, setCards] = useState<GameCard[]>(initCards);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const handleCardClick = (idx: number) => {
    if (isChecking || cards[idx].matched || cards[idx].flipped) return;
    if (selected.length === 1 && selected[0] === idx) return;

    const newCards = [...cards];
    newCards[idx] = { ...newCards[idx], flipped: true };
    setCards(newCards);

    if (selected.length === 0) {
      setSelected([idx]);
    } else {
      setMoves(m => m + 1);
      const firstIdx = selected[0];
      setSelected([]);
      if (newCards[firstIdx].pairId === newCards[idx].pairId) {
        setTimeout(() => {
          setCards(prev => {
            const u = [...prev];
            u[firstIdx] = { ...u[firstIdx], matched: true };
            u[idx]      = { ...u[idx],      matched: true };
            const allMatched = u.every(c => c.matched);
            if (allMatched) setGameOver(true);
            return u;
          });
        }, 400);
      } else {
        setIsChecking(true);
        setTimeout(() => {
          setCards(prev => {
            const u = [...prev];
            u[firstIdx] = { ...u[firstIdx], flipped: false };
            u[idx]      = { ...u[idx],      flipped: false };
            return u;
          });
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const restart = () => {
    setCards(initCards());
    setSelected([]);
    setMoves(0);
    setGameOver(false);
    setIsChecking(false);
  };

  const matched = cards.filter(c => c.matched).length / 2;

  return (
    <section id="mini-game" className="py-24 px-4 bg-slate-50">
      <div className="max-w-[800px] mx-auto">
        <SectionHeader
          label="Mini Game · Trò chơi"
          title="Ghép cặp lịch sử hội nhập"
          subtitle="Ghép các sự kiện với năm diễn ra. Lật bài và tìm cặp đúng nhanh nhất! 6 cặp × 2 = 12 bài."
          primaryColor={primaryColor}
        />

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-2xl px-5 py-3 border border-black/[0.06] shadow-sm">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold font-mono" style={{ color: primaryColor }}>{moves}</div>
              <div className="text-xs text-slate-400">Lượt đi</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-emerald-500">{matched}/6</div>
              <div className="text-xs text-slate-400">Cặp đúng</div>
            </div>
          </div>
          <button
            onClick={restart}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition-all hover:bg-slate-100"
            style={{ color: primaryColor }}
          >
            <RotateCcw className="w-4 h-4" />
            Chơi lại
          </button>
        </div>

        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-6 rounded-[20px] text-center border"
              style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}30` }}
            >
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-xl font-bold text-slate-900 mb-1" style={{ fontFamily: "'Newsreader', Georgia, serif" }}>
                Chúc mừng! Bạn đã ghép xong!
              </div>
              <div className="text-sm text-slate-500">Hoàn thành trong <strong>{moves} lượt</strong> — {moves <= 10 ? "Xuất sắc!" : moves <= 15 ? "Tốt!" : "Tiếp tục luyện tập!"}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3" style={{ perspective: "1000px" }}>
          {cards.map((card, idx) => (
            <motion.button
              key={`${card.id}-${card.content}`}
              onClick={() => handleCardClick(idx)}
              className="aspect-[4/3] relative rounded-2xl transition-all duration-150 cursor-pointer"
              whileHover={!card.flipped && !card.matched ? { y: -3, boxShadow: `0 12px 32px ${primaryColor}20` } : {}}
              whileTap={!card.flipped && !card.matched ? { scale: 0.97 } : {}}
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Back face (Cover) */}
              <div
                className="absolute inset-0 rounded-2xl flex items-center justify-center shadow-sm"
                style={{
                  backfaceVisibility: "hidden",
                  backgroundColor: primaryColor,
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <div className="text-white text-2xl opacity-60">🇻🇳</div>
              </div>

              {/* Front face (Content) */}
              <div
                className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-2 gap-1 shadow-sm"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  backgroundColor: card.matched ? "#ECFDF5" : "white",
                  border: `2px solid ${card.matched ? "#10B981" : "#E2E8F0"}`,
                }}
              >
                {card.type === "year" ? (
                  <span className="text-xl font-bold font-mono" style={{ color: card.matched ? "#059669" : primaryColor }}>
                    {card.content}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-center text-slate-700 leading-tight">{card.content}</span>
                )}
                {card.matched && <Check className="w-3 h-3 text-emerald-500" />}
              </div>
            </motion.button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 font-mono mt-6">
          Mẹo: Ghi nhớ vị trí bài để tìm cặp nhanh hơn · Dựa trên Timeline VN 1986–2022
        </p>
      </div>
    </section>
  );
}

// ─── FOOTER / REFERENCES ───────────────────────────────────────────────────────
function Footer({ primaryColor }: { primaryColor: string }) {
  const refs = [
    { id: "1", title: "WTO — Vietnam accession", url: "https://www.wto.org/english/thewto_e/countries_e/vietnam_e.htm" },
    { id: "2", title: "EVFTA — Ủy ban Châu Âu", url: "https://trade.ec.europa.eu/access-to-markets/en/content/eu-vietnam-free-trade-agreement" },
    { id: "3", title: "CPTPP — MFAT New Zealand", url: "https://www.mfat.govt.nz/en/trade/free-trade-agreements/free-trade-agreements-in-force/cptpp/" },
    { id: "4", title: "Cục Đầu tư nước ngoài — MPI VN", url: "https://fia.mpi.gov.vn/" },
    { id: "5", title: "UNCTAD — FDI Statistics Vietnam", url: "https://unctad.org/country/viet-nam" },
    { id: "6", title: "World Bank — Vietnam Economic Overview", url: "https://www.worldbank.org/en/country/vietnam/overview" },
    { id: "7", title: "AmCham Vietnam — Intel Case Study", url: "https://www.amchamvietnam.com/" },
    { id: "8", title: "Tổng cục Thống kê Việt Nam (GSO)", url: "https://www.gso.gov.vn/" },
  ];

  return (
    <footer id="nguon" className="bg-slate-900 text-white pt-20 pb-12 px-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold font-mono">VN · Hội nhập</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Tài liệu giáo dục về Hội nhập kinh tế quốc tế của Việt Nam — dành cho sinh viên đại học và người học độc lập.
            </p>
            <div className="flex gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                Giáo dục
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-300">
                2026
              </span>
            </div>
          </div>

          {/* Quick nav */}
          <div>
            <div className="text-xs font-mono text-slate-400 tracking-widest uppercase mb-4">Điều hướng</div>
            <div className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map(l => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="text-left text-sm text-slate-400 hover:text-white transition-colors py-1"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image credits */}
          <div>
            <div className="text-xs font-mono text-slate-400 tracking-widest uppercase mb-4">Credits hình ảnh</div>
            <div className="space-y-2 text-xs text-slate-500">
              <div>📸 Hero map: Tự thiết kế (SVG)</div>
              <div>📸 Video thumbnail: Unsplash · @saigon_photo · CC0</div>
              <div>📊 Dữ liệu: World Bank, MPI, UNCTAD</div>
              <div>🎓 Nội dung: Tổng hợp từ giáo trình Kinh tế quốc tế</div>
            </div>
          </div>
        </div>

        {/* References */}
        <div className="border-t border-slate-800 pt-10 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-4 h-4" style={{ color: primaryColor }} />
            <div className="text-sm font-mono font-semibold text-slate-300">Tài liệu tham khảo</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {refs.map(r => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors group"
              >
                <span className="text-xs font-mono text-slate-500 shrink-0 mt-0.5">[{r.id}]</span>
                <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{r.title}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0 ml-auto mt-0.5 transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600 font-mono text-center sm:text-left">
            © 2026 VN Hội nhập kinh tế quốc tế · Tài liệu giáo dục phi thương mại · Dữ liệu cập nhật đến 2024
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
            <span className="text-xs text-slate-600 font-mono">Được xây dựng với ❤️ cho giáo dục</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── APP ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState<ThemeName>("blue");
  const { progress, activeSection } = useScrollProgress();
  const t = THEMES[theme];

  // Update CSS vars for theme
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", t.primary);
    document.documentElement.style.setProperty("--ring", t.primary);
  }, [t]);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#F8FAFC", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      <Navbar
        activeSection={activeSection}
        progress={progress}
        theme={theme}
        setTheme={setTheme}
        primaryColor={t.primary}
      />
      <main>
        <HeroSection     primaryColor={t.primary} accentColor={t.accent} />
        <ConceptSection  primaryColor={t.primary} accentColor={t.accent} />
        <ContentSection  primaryColor={t.primary} />
        <ImpactSection   primaryColor={t.primary} />
        <DirectionsSection primaryColor={t.primary} />
        <CaseStudiesSection primaryColor={t.primary} />
        <TimelineSection primaryColor={t.primary} />
        <VideoSection    primaryColor={t.primary} />
        <QuizSection     primaryColor={t.primary} accentColor={t.accent} />
        <MiniGameSection primaryColor={t.primary} />
      </main>
      <Footer primaryColor={t.primary} />
    </div>
  );
}
