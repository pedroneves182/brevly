import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import RedirectPage from './pages/RedirectPage'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:shortUrl" element={<RedirectPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
