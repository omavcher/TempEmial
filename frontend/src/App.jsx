import React from 'react';
import { Toaster } from 'react-hot-toast';
import { TempEmail } from './components/TempEmail';
import { BulkEmailSender } from './components/BulkEmailSender';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-8 px-4">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Temporary Email Service
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Get a disposable email address for 10 minutes
            </p>
          </header>

          <div className="flex flex-col md:flex-row justify-center items-start gap-8">
          <TempEmail />
            <BulkEmailSender />
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

export default App;