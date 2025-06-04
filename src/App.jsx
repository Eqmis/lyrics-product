import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/home/home'

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
