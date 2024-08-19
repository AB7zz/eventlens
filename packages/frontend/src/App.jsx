import { useState } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import FaceScan from './pages/FaceScan'
import Upload from './pages/Upload'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'

function App() {

  return (
    <>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/facescan" element={<FaceScan />} />
            <Route path="/upload" element={<Upload />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </>
  )
}

export default App
