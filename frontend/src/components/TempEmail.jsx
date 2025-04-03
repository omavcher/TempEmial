import { useState, useEffect } from 'react';
import { Copy, Mail, Inbox, RefreshCw, Download, QrCode, Clock, Search, Trash } from 'lucide-react';
import { Button } from './ui/button';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from 'axios';
import api from '../hooks/api';
import toast from 'react-hot-toast';

// Utility functions
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export async function generateTempEmail() {
  try {
    const response = await axios.post(`${api}/api/email/generate`);
    if (!response.data?.email) {
      throw new Error('No email received from API');
    }
    return response.data.email;
  } catch (error) {
    console.error('Email generation error:', error);
    toast.error(error.response?.data?.message || 'Failed to generate email');
    throw error;
  }
}

export function generateQRCode(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

// Storage utility functions
const EMAIL_LIMIT = 5;
const HOUR_IN_MS = 60 * 60 * 1000;

const getEmailCountData = () => {
  const localData = JSON.parse(localStorage.getItem('emailCountData') || '{}');
  const sessionData = JSON.parse(sessionStorage.getItem('emailCountData') || '{}');
  return {
    count: localData.count || 0,
    timestamp: localData.timestamp || Date.now(),
    sessionCount: sessionData.count || 0
  };
};

const updateEmailCountData = (count) => {
  const timestamp = Date.now();
  const data = { count, timestamp };
  localStorage.setItem('emailCountData', JSON.stringify(data));
  sessionStorage.setItem('emailCountData', JSON.stringify({ count: (getEmailCountData().sessionCount || 0) + 1 }));
};

const canGenerateEmail = () => {
  const { count, timestamp, sessionCount } = getEmailCountData();
  const now = Date.now();
  
  if (now - timestamp > HOUR_IN_MS) {
    localStorage.setItem('emailCountData', JSON.stringify({ count: 0, timestamp: now }));
    sessionStorage.setItem('emailCountData', JSON.stringify({ count: 0 }));
    return true;
  }
  
  return count < EMAIL_LIMIT && sessionCount < EMAIL_LIMIT;
};

const getRemainingTime = () => {
  const { timestamp } = getEmailCountData();
  const timePassed = Date.now() - timestamp;
  return Math.max(0, HOUR_IN_MS - timePassed);
};

export function TempEmail() {
  const [emails, setEmails] = useState([]);
  const [activeEmailIndex, setActiveEmailIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [showQR, setShowQR] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  // Initial setup
  useEffect(() => {
    const initializeEmail = async () => {
      setIsLoading(true);
      try {
        if (canGenerateEmail()) {
          const newEmail = await generateTempEmail();
          setEmails([{ address: newEmail, messages: [] }]);
          updateEmailCountData(1);
        } else {
          toast.error('Email generation limit reached for this hour');
        }
      } catch (error) {
        toast.error('Failed to initialize email service');
      } finally {
        setIsLoading(false);
      }
    };
    initializeEmail();
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else {
      toast.error('Email session expired');
    }
  }, [timeLeft]);

  // Email refresh
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!emails[activeEmailIndex]) return;
      setIsRefreshing(true);
      try {
        const response = await axios.post(`${api}/api/email/fetch-messages`, 
          { email: emails[activeEmailIndex].address }
        );
        // Update messages with the nested data.messages from response
        setEmails(prev => prev.map((email, idx) => 
          idx === activeEmailIndex ? { ...email, messages: response.data.data.messages || [] } : email
        ));
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setIsRefreshing(false);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeEmailIndex, emails]);

  const addNewEmail = async () => {
    setIsLoading(true);
    setRequestCount(prev => prev + 1);

    if (!canGenerateEmail()) {
      const remainingMs = getRemainingTime();
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      toast.error(`Email limit reached. Please wait ${remainingMinutes} minutes`);
      setIsLoading(false);
      return;
    }

    try {
      const newEmail = await generateTempEmail();
      const emailExists = emails.some(email => email.address === newEmail);
      if (emailExists) {
        if (requestCount >= 3) {
          toast.error('Too many requests: Please try again later');
          setRequestCount(0);
        } else {
          toast.error('Duplicate email received, trying again...');
          setTimeout(addNewEmail, 1000);
        }
        return;
      }

      setEmails(prev => [...prev, { address: newEmail, messages: [] }]);
      setActiveEmailIndex(emails.length);
      setTimeLeft(600);
      setRequestCount(0);
      updateEmailCountData(getEmailCountData().count + 1);
      toast.success('New email generated');
    } catch (error) {
      toast.error('Failed to generate new email');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEmail = (index) => {
    if (emails.length === 1) {
      toast.error('Cannot delete the last email');
      return;
    }
    setEmails(prev => prev.filter((_, i) => i !== index));
    setActiveEmailIndex(prev => prev > 0 ? prev - 1 : 0);
    toast.success('Email deleted');
  };

  const copyEmail = async () => {
    await navigator.clipboard.writeText(emails[activeEmailIndex].address);
    toast.success('Email copied to clipboard');
  };

  const extendTime = () => {
    setTimeLeft(600);
    toast.success('Time extended by 10 minutes');
  };

  const downloadEmail = (message) => {
    const element = document.createElement('a');
    const file = new Blob(
      [
        `From: ${message.from}\n` +
        `Subject: ${message.subject}\n` +
        `Date: ${formatDate(new Date(message.receivedAt * 1000))}\n\n` +
        message.bodyPreview
      ],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `email-${message._id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredMessages = emails[activeEmailIndex]?.messages.filter(
    message => 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.from.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (isLoading && emails.length === 0) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full md:w-[45%] min-w-[45%] mx-auto">
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 dark:text-white">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
            Temporary Email
          </h2>
          <Button onClick={addNewEmail} variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Add Email'}
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Valid for 10 minutes (Max 5 emails per hour)</p>
      </div>

      {emails.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {emails.map((email, index) => (
            <div key={email.address} className="flex items-center gap-1">
              <Button
                variant={index === activeEmailIndex ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveEmailIndex(index)}
                className="whitespace-nowrap text-xs sm:text-sm"
              >
                {email.address.split('@')[0]}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteEmail(index)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <span className="flex-1 font-mono text-sm sm:text-lg dark:text-white break-all">
          {emails[activeEmailIndex]?.address}
        </span>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button onClick={() => setShowQR(true)} variant="outline" size="sm">
            <QrCode className="w-4 h-4" />
          </Button>
          <Button onClick={copyEmail} variant="outline" size="sm">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-lg sm:text-xl font-semibold dark:text-white">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <Button onClick={extendTime} variant="outline" size="sm" disabled={timeLeft === 0}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Extend Time
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 sm:w-5 sm:h-5" />
            <h3 className="text-base sm:text-lg font-semibold dark:text-white">
              Inbox {isRefreshing && '(Refreshing...)'} ({filteredMessages.length} messages)
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search emails..."
              className="px-3 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full sm:w-48 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {filteredMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            No messages yet
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
            {filteredMessages.map(message => (
              <div
                key={message._id}
                className="p-3 sm:p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                  <div className="w-full sm:w-3/4">
                    <h4 className="font-medium dark:text-white text-sm sm:text-base line-clamp-1">
                      {message.subject || '(No Subject)'}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      From: {message.from}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(new Date(message.receivedAt * 1000))}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadEmail(message)}
                      title="Download email"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      title="Delete email"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {message.attachmentsCount > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    <div className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs sm:text-sm">
                      📎 {message.attachmentsCount} attachment(s)
                    </div>
                  </div>
                )}
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {message.bodyPreview || '(No preview available)'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-sm">
            <h3 className="text-base sm:text-lg font-semibold mb-4 dark:text-white line-clamp-1">
              QR Code for {emails[activeEmailIndex].address}
            </h3>
            <img
              src={generateQRCode(emails[activeEmailIndex].address)}
              alt="QR Code"
              className="mx-auto mb-4 w-32 h-32 sm:w-48 sm:h-48"
            />
            <Button
              onClick={() => setShowQR(false)}
              className="w-full text-sm sm:text-base"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TempEmail;