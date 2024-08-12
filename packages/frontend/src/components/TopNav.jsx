import React from 'react'
import { Link } from 'react-router-dom'

const TopNav = () => {
  return (
    <div className='bg-purple-500 py-5 pl-10 pr-5 flex justify-between items-center'>
      <p className='text-white pacifico text-5xl'>eventlens</p>
      <div className='flex'>
        <Link to='/login'><button className='bg-white rounded text-purple-500 px-10 py-2 signika text-lg hover:bg-zinc-100 mr-7'>Log in</button></Link>
        <Link to='/login'><button className='bg-black rounded text-white px-10 py-2 signika text-lg hover:bg-zinc-900'>Sign up</button></Link>
      </div>
    </div>
  )
}

export default TopNav