
import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      console.log('Logging in with', { email, password });
    }
  };

  const handleSignUpRedirect = () => {
    
  };

  return (
    <div className="flex flex-col justify-center items-center  bg-gray-100 p-20">
      <div className="bg-white p-10 rounded-xl shadow-lg border border-purple-500 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-purple-600 mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="text"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              className="block w-full p-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className="block w-full p-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full p-3 rounded-lg text-white ${isFormValid ? 'bg-purple-500 hover:bg-purple-600' : 'bg-purple-500 hover:bg-purple-600 cursor-not-allowed'}`}
          >
            Log In
          </button>
        </form>
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <a href="#" className="hover:text-purple-500">Forgot Password?</a>
          <Link to='/Signup'>
          <button
            onClick={handleSignUpRedirect}
            className="text-purple-500 hover:underline"
          >
            Don't have an account? Sign up
          </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
