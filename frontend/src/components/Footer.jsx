import { Mail, Phone, MapPin, Moon, Zap, Smartphone, Heart, Twitter, Github, Linkedin, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-md mt-12">
      {/* Top Social Media Section */}
      <div className="bg-primary/10 dark:bg-primary/20 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold dark:text-white">Connect With Us</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Follow our social channels for updates and tips
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://x.com/omawchar07" className="bg-white dark:bg-gray-700 p-3 rounded-full shadow-sm hover:bg-primary/10 dark:hover:bg-primary/30 transition-colors">
                <Twitter className="h-6 w-6 text-blue-400" />
              </a>
              <a href="https://github.com/omavcher" className="bg-white dark:bg-gray-700 p-3 rounded-full shadow-sm hover:bg-primary/10 dark:hover:bg-primary/30 transition-colors">
                <Github className="h-6 w-6 text-gray-800 dark:text-gray-200" />
              </a>
              <a href="https://www.linkedin.com/in/omawchar/" className="bg-white dark:bg-gray-700 p-3 rounded-full shadow-sm hover:bg-primary/10 dark:hover:bg-primary/30 transition-colors">
                <Linkedin className="h-6 w-6 text-blue-600" />
              </a>
              <a href="https://www.instagram.com/omawchar07/" className="bg-white dark:bg-gray-700 p-3 rounded-full shadow-sm hover:bg-primary/10 dark:hover:bg-primary/30 transition-colors">
                <Instagram className="h-6 w-6 text-pink-600" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Our Services */}
          <div>
            <h3 className="font-semibold mb-4 dark:text-white">Our Services</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✔️</span>
                <span className="text-gray-600 dark:text-gray-400">
                  Temporary Email – Get a disposable email for 10 minutes.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✔️</span>
                <span className="text-gray-600 dark:text-gray-400">
                  Bulk Email Sender – Send emails in bulk with AI-generated templates.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✔️</span>
                <span className="text-gray-600 dark:text-gray-400">
                  AI-Powered Templates – Generate and customize email designs instantly.
                </span>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="font-semibold mb-4 dark:text-white">Company Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">🔹</span>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                  About Us – Empowering users with secure and efficient email solutions.
                </a>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">🔹</span>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                  Privacy Policy – We prioritize your privacy and data security.
                </a>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">🔹</span>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                  Terms & Conditions – Guidelines to ensure fair usage of our services.
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-semibold mb-4 dark:text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">omawchar07@gmail.com</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">+91 9890712303</span>
              </li>
              <li className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-400">Nagpur, maharashtra</span>
              </li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h3 className="font-semibold mb-4 dark:text-white">Stay Connected</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="flex items-center text-gray-600 dark:text-gray-400">
                <Moon className="h-4 w-4 mr-1" /> Dark Mode
              </span>
              <span className="flex items-center text-gray-600 dark:text-gray-400">
                <Zap className="h-4 w-4 mr-1" /> Fast & Lightweight
              </span>
              <span className="flex items-center text-gray-600 dark:text-gray-400">
                <Smartphone className="h-4 w-4 mr-1" /> Mobile Responsive
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
          <p className="flex flex-col items-center justify-center ">
            © 2025 TempEmailPro. All rights reserved. <br></br> Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> for privacy & efficiency.
          </p>
        </div>
      </div>
    </footer>
  );
}