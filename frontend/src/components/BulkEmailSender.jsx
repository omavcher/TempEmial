import { useState, useEffect } from 'react';
import { Upload, Send, Wand2, Eye, Lock, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import api from '../hooks/api';

export function BulkEmailSender() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState([]);
  const [commaSeparatedEmails, setCommaSeparatedEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedTemplates, setGeneratedTemplates] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    audience: 'Customers',
    purpose: 'Marketing',
    details: ''
  });
  const [emailConfigs, setEmailConfigs] = useState([
    { id: 1, senderEmail: '', appPassword: '' }
  ]);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [sendingProgress, setSendingProgress] = useState({
    isSending: false,
    sent: 0,
    total: 0,
    failed: 0
  });

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        setIsLoggedIn(true);
      }
      setLoading(false);
    };
    checkAuthStatus();
  }, []);

  const handleFileUpload = (event) => {
    if (!isLoggedIn) {
      toast.error('Please login to upload files');
      return;
    }
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        const emailList = text.split('\n').map(email => email.trim()).filter(Boolean);
        setEmails(emailList);
      };
      reader.readAsText(file);
    }
  };

  const handleManualEmails = (event) => {
    if (!isLoggedIn) {
      toast.error('Please login to add emails');
      return;
    }
    const emailList = event.target.value.split('\n').map(email => email.trim()).filter(Boolean);
    setEmails(emailList);
  };

  const handleCommaSeparatedEmails = (event) => {
    if (!isLoggedIn) {
      toast.error('Please login to add emails');
      return;
    }
    const input = event.target.value;
    setCommaSeparatedEmails(input);
    const emailList = input.split(',').map(email => email.trim()).filter(Boolean);
    setEmails(emailList);
  };

  const handleTemplateGenerate = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Please login to generate templates');
      return;
    }

    try {
      const response = await axios.post(`${api}/api/ai/generate-templates`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setGeneratedTemplates(response.data.templates);
    } catch (error) {
      toast.error('Failed to generate templates: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleTemplateSelect = (template) => {
    setSubject(template.subject);
    setContent(template.content);
    setShowTemplateModal(false);
  };

  const addEmailConfig = () => {
    const newId = emailConfigs.length + 1;
    setEmailConfigs([...emailConfigs, { id: newId, senderEmail: '', appPassword: '' }]);
  };

  const removeEmailConfig = (id) => {
    if (emailConfigs.length > 1) {
      setEmailConfigs(emailConfigs.filter(config => config.id !== id));
    }
  };

  const updateEmailConfig = (id, field, value) => {
    setEmailConfigs(emailConfigs.map(config => 
      config.id === id ? { ...config, [field]: value } : config
    ));
  };

  const handleSendEmails = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to send emails');
      return;
    }

    const validConfigs = emailConfigs.filter(config => 
      config.senderEmail && config.appPassword
    );

    if (validConfigs.length === 0) {
      toast.error('Please provide at least one sender email and app password');
      return;
    }

    if (!emails.length) {
      toast.error('Please add recipient emails');
      return;
    }

    if (!subject || !content) {
      toast.error('Please provide email subject and content');
      return;
    }

    setSendingProgress({
      isSending: true,
      sent: 0,
      total: emails.length,
      failed: 0
    });

    try {
      const response = await axios.post(`${api}/api/ai/send-emails`, { // Corrected endpoint
        recipients: emails,
        subject,
        content,
        emailConfigs: validConfigs
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Handle successful response
      const { message, total, initialFailed } = response.data;
      if (message === "Email sending started") {
        setSendingProgress({
          isSending: true,
          sent: 0,
          total: total || emails.length,
          failed: initialFailed || 0
        });
        toast.success('Email sending process started!');
        
        // Simulate completion for demo (replace with WebSocket/polling in production)
        setTimeout(() => {
          setSendingProgress(prev => ({
            ...prev,
            isSending: false,
            sent: prev.total - prev.failed, // Assume remaining succeeded
            failed: prev.failed
          }));
          toast.success(`Emails sent: ${total - initialFailed}, Failed: ${initialFailed} (simulated)`);
        }, 5000);
      } else {
        throw new Error('Unexpected response from server');
      }

    } catch (error) {
      setSendingProgress({
        isSending: false,
        sent: 0,
        total: 0,
        failed: 0
      });

      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.message || error.message;
      switch (errorMessage) {
        case "Missing or invalid required fields":
          toast.error('Please provide all required fields correctly.');
          break;
        case "Each email config must have a valid senderEmail and appPassword":
          toast.error('All sender emails and app passwords must be valid.');
          break;
        case "No valid recipient emails provided":
          toast.error('No valid recipient emails were provided.');
          break;
        case "No valid email configurations available":
          toast.error('No valid email configurations available. Check your sender email and app password.');
          break;
        case "Email sending failed":
          toast.error(`Email sending failed: ${error.response?.data?.error || 'Unknown error'}`);
          break;
        default:
          toast.error(`Failed to send emails: ${errorMessage}`);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
        <Lock className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 text-center">
          Authentication Required
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          You need to be logged in to access the bulk email sender.
        </p>
        <Button className="mt-4 w-full">Login to Continue</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <Send className="w-6 h-6" />
          Bulk Email Sender
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Send emails to multiple recipients</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-4 border-b pb-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sender Accounts
            </label>
            <Button variant="outline" size="sm" onClick={addEmailConfig}>
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </div>
          
          {emailConfigs.map((config) => (
            <div key={config.id} className="space-y-2 border p-3 rounded-md relative">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sender Email
                </label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary"
                  placeholder="your.email@gmail.com"
                  value={config.senderEmail}
                  onChange={(e) => updateEmailConfig(config.id, 'senderEmail', e.target.value)}
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    App Password
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHelpDialog(true)}
                  >
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Help
                  </Button>
                </div>
                <input
                  type="password"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary"
                  placeholder="Enter your app password"
                  value={config.appPassword}
                  onChange={(e) => updateEmailConfig(config.id, 'appPassword', e.target.value)}
                />
              </div>
              {emailConfigs.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeEmailConfig(config.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recipients
          </label>
          <div className="space-y-4">
            <textarea
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary"
              placeholder="Enter email addresses (one per line)"
              onChange={handleManualEmails}
            />
            <input
              type="text"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary"
              placeholder="Enter emails (comma-separated, e.g., email1@example.com, email2@example.com)"
              value={commaSeparatedEmails}
              onChange={handleCommaSeparatedEmails}
            />
            <div>
              <label className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                <Upload className="w-4 h-4 mr-2" />
                <span>Upload CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary"
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Content
            </label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowTemplateModal(true)}>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Template
              </Button>
            </div>
          </div>
          <textarea
            className="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded-md font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary"
            placeholder="Enter email content (HTML supported)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <Button 
          className="w-full" 
          onClick={handleSendEmails}
          disabled={sendingProgress.isSending}
        >
          <Send className="w-4 h-4 mr-2" />
          {sendingProgress.isSending ? 'Sending...' : 'Send Emails'}
        </Button>

        {sendingProgress.total > 0 && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(sendingProgress.sent / sendingProgress.total) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Sent: {sendingProgress.sent} / {sendingProgress.total}</p>
              <p>Failed: {sendingProgress.failed}</p>
              <p>Remaining: {sendingProgress.total - sendingProgress.sent - sendingProgress.failed}</p>
            </div>
          </div>
        )}
      </div>

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-100 dark:bg-gray-900 text-foreground rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Generate Email Template</h3>
            
            {!generatedTemplates.length ? (
              <form onSubmit={handleTemplateGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({...formData, audience: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary"
                  >
                    <option value="Customers">Customers</option>
                    <option value="Employees">Employees</option>
                    <option value="Students">Students</option>
                    <option value="Partners">Partners</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Purpose
                  </label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Newsletter">Newsletter</option>
                    <option value="Invitation">Invitation</option>
                    <option value="Announcement">Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Key Details
                  </label>
                  <textarea
                    value={formData.details}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary h-32"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">Generate Templates</Button>
              </form>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                {generatedTemplates.map((template) => (
                  <div key={template.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white truncate">{template.subject}</h4>
                    <div className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-800 p-4 rounded overflow-y-auto">
                      <div 
                        className="text-sm prose dark:prose-invert max-w-none"
                        style={{ 
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word'
                        }}
                        dangerouslySetInnerHTML={{ __html: template.content }} 
                      />
                    </div>
                    <Button
                      onClick={() => handleTemplateSelect(template)}
                      className="mt-4 w-full"
                    >
                      Select Template
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <Button
              variant="outline"
              className="mt-4 w-full sm:w-auto"
              onClick={() => {
                setShowTemplateModal(false);
                setGeneratedTemplates([]);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-100 dark:bg-gray-900 text-foreground rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Email Preview</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded mb-4">
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">{subject}</h4>
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }} 
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="w-full sm:w-auto"
            >
              Close Preview
            </Button>
          </div>
        </div>
      )}

      {showHelpDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">How to Get an App Password</h3>
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <div>
                <h4 className="font-semibold text-lg mb-2">Step 1: Enable 2-Step Verification</h4>
                <p className="mb-3">Go to your Google Account settings and enable 2-Step Verification if not already enabled.</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Step 2: Access App Passwords</h4>
                <p className="mb-3">In your Google Account, go to Security  App passwords.</p>
                <img 
                  src="/1.png" 
                  alt="App Passwords section screenshot" 
                  className="w-full max-w-md h-auto rounded-lg shadow-md object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Step 3: Generate Password</h4>
                <p className="mb-3">Select 'Other' from the app dropdown, name it 'Bulk Email Sender', and click Generate.</p>
                <img 
                  src="/2.png" 
                  alt="Generate password screenshot" 
                  className="w-full max-w-md h-auto rounded-lg shadow-md object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Step 4: Copy Password</h4>
                <p>Copy the generated 16-character password and paste it in the App Password field.</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="mt-6 w-full sm:w-auto"
              onClick={() => setShowHelpDialog(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}