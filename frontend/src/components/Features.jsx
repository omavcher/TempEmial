import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Toaster } from 'react-hot-toast';
import { Mail, Clock, RefreshCw, Eye, Code, FileText, Calendar, Smartphone, Zap } from 'lucide-react';

export default function Features() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-12 px-4">
          <header className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Temporary Email & Bulk Email Service?
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Powerful tools for secure communication and efficient email marketing
            </p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Temporary Email Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🔥 Temporary Email Service</h2>
              </div>
              <ul className="space-y-3">
                <FeatureItem icon="✅" text="Instant Email Creation → Get a fully functional temporary email in seconds" />
                <FeatureItem icon="✅" text="10-Minute Expiry → Emails auto-delete after 10 minutes for privacy" />
                <FeatureItem icon="✅" text="Real-Time Inbox → Receive and read messages instantly" />
                <FeatureItem icon="✅" text="Auto-Renew Option → Extend email lifespan if needed" />
                <FeatureItem icon="✅" text="Spam-Free Experience → No junk mail, only the emails you need" />
              </ul>
            </section>

            {/* Bulk Email Sender Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📩 Bulk Email Sender</h2>
              </div>
              <ul className="space-y-3">
                <FeatureItem icon="✅" text="Manual & File Upload Support → Enter emails or upload a CSV file" />
                <FeatureItem icon="✅" text="Plain & HTML Emails → Choose between simple text or custom-designed emails" />
                <FeatureItem icon="✅" text="AI-Powered Template Generator → Get 4 custom HTML templates based on your input" />
                <FeatureItem icon="✅" text="Preview & Select Templates → See how your email looks before sending" />
                <FeatureItem icon="✅" text="Email Personalization → Use placeholders like {name} for dynamic content" />
                <FeatureItem icon="✅" text="Scheduled Emails → Set emails to be sent at a future time" />
              </ul>
            </section>

            {/* AI Template Generator Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
                  <Code className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🎨 AI-Powered Template Generator</h2>
              </div>
              <ul className="space-y-3">
                <FeatureItem icon="✅" text="Easy Input Form → Enter subject, audience, and key details to generate templates" />
                <FeatureItem icon="✅" text="4 Unique AI-Generated Templates → Choose from professionally designed options" />
                <FeatureItem icon="✅" text="Live Editing → Modify colors, fonts, and styles before sending" />
                <FeatureItem icon="✅" text="Save & Reuse Templates → Store your favorite designs for future use" />
              </ul>
            </section>

            {/* Additional Features Section */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-3">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 mr-4">
                  <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">💡 Additional Features</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FeatureCard 
                  icon={<Moon className="h-6 w-6" />} 
                  title="Dark Mode Support" 
                  emoji="🌙" 
                />
                <FeatureCard 
                  icon={<Smartphone className="h-6 w-6" />} 
                  title="Mobile-Responsive UI" 
                  emoji="📱" 
                />
                <FeatureCard 
                  icon={<Zap className="h-6 w-6" />} 
                  title="Fast & Lightweight" 
                  emoji="⚡" 
                />
                <FeatureCard 
                  icon={<Mail className="h-6 w-6" />} 
                  title="No Sign-Up Required" 
                  emoji="🚀" 
                />
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <Toaster
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
        }}
      />
    </div>
  );
}

function FeatureItem({ icon, text }) {
  return (
    <li className="flex items-start">
      <span className="mr-2 text-green-500 dark:text-green-400">{icon}</span>
      <span className="text-gray-700 dark:text-gray-300">{text}</span>
    </li>
  );
}

function FeatureCard({ icon, title, emoji }) {
  return (
    <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 mr-3">
        {React.cloneElement(icon, { className: "h-5 w-5 text-gray-700 dark:text-gray-300" })}
      </div>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        <span className="text-lg">{emoji}</span>
      </div>
    </div>
  );
}