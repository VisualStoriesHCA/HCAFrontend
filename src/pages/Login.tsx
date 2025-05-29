import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ItemsService } from "@/lib/api";
import { useUserContext } from "@/App";
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const { userInformation, setUserInformation } = useUserContext();
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);
    const [userName, setUserName] = useState('');
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const clearError = () => {
        if (errorMessage) {
            setErrorMessage('');
        }
    };

    useEffect(() => {
        if (userInformation && userInformation.userId) {
            // If userId is already set, redirect to home page
            navigate('/');
        }
    }, [userInformation?.userId, navigate]);

    const handleLogin = async (userName: string) => {
        setIsLoading(true);
        try {
            const data = await ItemsService.getUserInfoByUsername(userName);
            if (data) {
                setUserInformation(data);
                console.log("User logged in successfully:", data);
                navigate('/'); // Use navigate instead of window.location.href
            } else {
                setErrorMessage("Username does not exist. Please check your username or register for a new account.");
            }
        } catch (error) {
            console.error("Login failed:", error);
            setErrorMessage("Username does not exist. Please check your username or register for a new account.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (userName: string, name: string) => {
        setIsLoading(true);
        try {
            const data = await ItemsService.createUser({"userName": userName, "name": name});
            if (data) {
                setUserInformation(data);
                console.log("User registered successfully:", data);
                navigate('/'); // Use navigate instead of window.location.href
            }
        } catch (error) {
            console.error("Registration failed:", error);
            setErrorMessage("Username is already taken. Please choose a different username.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(''); 
        
        if (isRegistering) {
            if (userName && name) {
                handleRegister(userName, name);
            }
        } else {
            if (userName) {
                handleLogin(userName);
            }
        }
    };

    const resetForm = () => {
        setUserName('');
        setName('');
        setErrorMessage('');
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        resetForm();
    };

    const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(e.target.value);
        clearError();
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        clearError();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white border rounded-lg shadow-sm p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900">
                            {isRegistering ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-gray-500 mt-2">
                            {isRegistering 
                                ? 'Please fill in your details to register' 
                                : 'Please sign in to your account'
                            }
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{errorMessage}</p>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label 
                                htmlFor="userName" 
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Username
                            </label>
                            <input
                                id="userName"
                                type="text"
                                value={userName}
                                onChange={handleUserNameChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter your username"
                            />
                        </div>

                        {isRegistering && (
                            <div>
                                <label 
                                    htmlFor="name" 
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={handleNameChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full mt-6"
                            variant="default"
                            disabled={isLoading}
                        >
                            {isLoading 
                                ? (isRegistering ? 'Creating Account...' : 'Signing In...') 
                                : (isRegistering ? 'Create Account' : 'Sign In')
                            }
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline"
                            disabled={isLoading}
                        >
                            {isRegistering
                                ? 'Already have an account? Sign in'
                                : "Don't have an account? Register"
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;