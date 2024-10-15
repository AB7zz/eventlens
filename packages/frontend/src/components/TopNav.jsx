import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/StateContext';
import { getAuth, signOut } from 'firebase/auth'; // Import Firebase auth functions

const TopNav = () => {
  const { loggedIn, setLoggedIn } = useUser();
  const navigate = useNavigate(); // For redirection

  const handleLogOut = () => {
    const auth = getAuth(); // Initialize Firebase auth
    signOut(auth)
      .then(() => {
        // Sign-out successful
        setLoggedIn(false); // Update the context state
        navigate('/login'); // Redirect to login page
      })
      .catch((error) => {
        console.error('Error logging out:', error); // Handle errors
      });
  };

  return (
    <div className='bg-purple-500 py-5 pl-10 pr-5 flex justify-between items-center'>
      <p className='text-white pacifico text-5xl'>eventlens</p>
      <div className='flex'>
        {loggedIn ? (
          <>
            <button
              onClick={handleLogOut}
              className='bg-white rounded text-purple-500 px-10 py-2 signika text-lg hover:bg-zinc-100 mr-7'
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to='/login'>
              <button className='bg-white rounded text-purple-500 px-10 py-2 signika text-lg hover:bg-zinc-100 mr-7'>
                Log in
              </button>
            </Link>
            <Link to='/signup'>
              <button className='bg-black rounded text-white px-10 py-2 signika text-lg hover:bg-zinc-900'>
                Sign up
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default TopNav;
