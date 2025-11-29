
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary text-white/80 py-8 mt-auto border-t border-accent">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="font-bold text-white mb-4">Amravati Municipal Corporation</h3>
            <p className="mb-2">Rajkamal Square, Amravati - 444601</p>
            <p>Email: contact@amravaticorporation.in</p>
            <p>Helpline: 1800-123-4567</p>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Digital Archives</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Official Access</h3>
            <p className="mb-4 text-xs">Restricted access for corporation staff and library administrators only.</p>
            <Link href="/portal/admin-access">
              <span className="inline-block px-3 py-1 border border-white/20 rounded text-xs hover:bg-white/10 cursor-pointer transition-colors">
                Staff / Official Login
              </span>
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-white/10 text-center text-xs">
          <p>© 2024 Amravati Municipal Corporation. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
