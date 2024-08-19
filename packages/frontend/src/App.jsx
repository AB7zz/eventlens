import { useState } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import FaceScan from './pages/FaceScan'
import Upload from './pages/Upload'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/facescan" element={<FaceScan />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
