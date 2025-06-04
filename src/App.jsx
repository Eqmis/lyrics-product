import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/home/home'
import Summary from './pages/summary/summary'

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/summary" element={<Summary />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
