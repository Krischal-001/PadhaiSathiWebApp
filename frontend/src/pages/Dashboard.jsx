import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📚 PadhaiSathi</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      <div className="dashboard-content">
        <h2>Welcome, {user?.username}! 👋</h2>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
        <p>More features coming soon...</p>
      </div>
    </div>
  )
}

export default Dashboard