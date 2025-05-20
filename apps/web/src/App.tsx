import { Routes, Route, Navigate } from 'react-router-dom'
import RagPage from './pages/RagPage'

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/rag" replace />} />
        <Route path="/rag" element={<RagPage />} />
      </Routes>
    </div>
  )
}

export default App
