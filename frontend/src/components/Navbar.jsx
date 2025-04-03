import { useState, useEffect } from 'react';
import { Mail, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'react-hot-toast';
import api from '../hooks/api'
export function Navbar() {
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const tokenParts = credentialResponse.credential.split('.');
      const decodedPayload = JSON.parse(atob(tokenParts[1]));

      const userData = {
        email: decodedPayload.email,
        name: decodedPayload.name,
        picture: decodedPayload.picture,
        googleId: decodedPayload.sub
      };

      // Replace with your actual backend endpoint
      const response = await axios.post(`${api}/api/auth/google`, userData);

      if (response.data && response.data.user) {
        const completeUserData = {
          ...userData,
          ...response.data.user
        };

        localStorage.setItem('user', JSON.stringify(completeUserData));
        localStorage.setItem('token', response.data.token || response.data.accessToken);
        setUser(completeUserData);
        toast.success('Login successful!');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    toast.error('Google login failed. Please try another method.');
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setShowProfileMenu(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">TempMail</span>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-6">

            <div className="flex items-center space-x-2">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 focus:outline-none"
                    disabled={isLoading}
                  >
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                      referrerpolicy="no-referrer"
                    />
                    <span className="hidden md:inline text-gray-900 dark:text-white">{user.name}</span>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Logging out...' : 'Logout'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  useOneTap
                  theme={theme === 'dark' ? 'filled_white' : 'filled_black'}
                  shape="rectangular"
                  size="medium"
                  logo_alignment="left"
                />
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}