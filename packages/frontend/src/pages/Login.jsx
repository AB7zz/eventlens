import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { auth, signInWithEmailAndPassword } from '../firebase/firebaseconfig.js'; // Adjust the import path as needed
import { useUser } from '../context/StateContext.jsx';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // To store error messages
  const navigate = useNavigate(); // For redirection
  const { loggedIn, setLoggedIn } = useUser()

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  // Handle form submission
  const handleSubmit = async (e) => {
    console.log('submit');
    e.preventDefault();
    if (isFormValid) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setLoggedIn(true)
        navigate('/upload'); // Redirect after successful login
      } catch (error) {
        setError(error.message); // Set the error message to be displayed
      }
    }
  };

  useEffect(() => {
    if(loggedIn){
      navigate('/upload')
    }
  }, [loggedIn])

  return (
    <div className="flex flex-col justify-center items-center bg-gray-100 p-20">
      <div className="bg-white p-10 rounded-xl shadow-lg border border-purple-500 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-purple-600 mb-6 text-center">Login</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>} {/* Display error message */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              className="block w-full p-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              required
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
              required
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
          <Link to='/signup'>
            <button
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
