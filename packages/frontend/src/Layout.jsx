import React from 'react'
import TopNav from './components/TopNav'

const Layout = ({ children }) => {
  return (
    <>
        <TopNav />
        <div>
            {children}
        </div>
    </>
  )
}

export default Layout