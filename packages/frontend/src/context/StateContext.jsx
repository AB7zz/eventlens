import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Firebase auth

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false); // Default: user is not logged in

  useEffect(() => {
    const auth = getAuth(); // Initialize Firebase auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in
        setLoggedIn(true);
      } else {
        // User is logged out
        setLoggedIn(false);
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ loggedIn, setLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
