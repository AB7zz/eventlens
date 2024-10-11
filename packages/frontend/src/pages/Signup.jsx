import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { auth, createUserWithEmailAndPassword } from '../firebase/firebaseconfig.js';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isFormValid = isValidEmail(email) &&
    password.trim() !== '' &&
    confirmPassword.trim() !== '' &&
    password === confirmPassword;

  const handleSubmit = async (e) => {

    e.preventDefault();
    if (isFormValid) {
      try {

        await createUserWithEmailAndPassword(auth, email, password);
        console.log('submit');
        console.log('User created successfully');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        navigate('/login');
      } catch (error) {
        setError(error.message);
      }
    } else {
      setError('Please enter a valid email and matching passwords.');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center bg-gray-100 p-14">
      <div className="bg-white p-10 rounded-xl shadow-lg border border-purple-500 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-purple-600 mb-6 text-center">Create an Account</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
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
          <div className="mb-4">
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
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="block w-full p-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            {password !== confirmPassword && confirmPassword.trim() !== '' && (
              <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
            )}
          </div>
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full p-3 rounded-lg text-white ${isFormValid ? 'bg-purple-500 hover:bg-purple-600' : 'bg-purple-500 hover:bg-purple-600 cursor-not-allowed'}`}
          >
            Sign Up
          </button>
        </form>
        <div className="flex justify-center mt-4 text-sm text-gray-600 text-center">
          <p>Already have an account?</p>
          <Link to='/login'>
            <button className="text-purple-500 hover:underline">Log in</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
