import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Branding section */}
          <div>
            <div className="flex items-center mb-4">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="ml-2 text-2xl font-bold">Inkspire</span>
            </div>
            <p className="text-gray-400 mb-4">
              The AI-Powered eBook Marketplace founded by Lieutenant, connecting authors and readers directly.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
          
          {/* Discover */}
          <div>
            <h3 className="text-lg font-bold mb-4">Discover</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  New Releases
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Reading Lists
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Authors
                </Link>
              </li>
            </ul>
          </div>
          
          {/* For Authors */}
          <div>
            <h3 className="text-lg font-bold mb-4">For Authors</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/author-dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Publish with Us
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Pricing & Commissions
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Author Resources
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Marketing Tools
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Help & Support */}
          <div>
            <h3 className="text-lg font-bold mb-4">Help & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Footer bottom */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {currentYear} Inkspire. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
