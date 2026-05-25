import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaEye, FaEyeSlash, FaGoogle, FaApple } from 'react-icons/fa'
import './Login.css'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return setError('Passwords do not match')
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="header">
        <div className="logo"><h4>PadhaiSathi</h4></div>
      </div>
      <div className="main">
        {/* Left */}
        <div className="left">
          <div className="circle-logo"><h1>PDS</h1></div>
          <div className="shape triangle1"></div>
          <div className="shape triangle2"></div>
          <div className="circle c1"></div>
          <div className="circle c2"></div>
          <div className="discover-text">
            <h1>Discover</h1>
            <h1>teacher</h1>
            <h1>within</h1>
            <h1>you</h1>
          </div>
        </div>

        {/* Right */}
        <div className="right">
          <div className="tabs">
            <span className="tab active">Create Account</span>
            <Link to="/login" className="tab">Log in</Link>
          </div>

          <div className="form-section">
            <h2>Welcome to Padhai sathi</h2>
            <p style={{ color: '#888', marginBottom: '20px', fontSize: '0.9rem' }}>
              Create your account and Discover teacher within you
            </p>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input type="text" name="username" placeholder="Full name"
                  value={form.username} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <input type="email" name="email" placeholder="Email"
                  value={form.email} onChange={handleChange} required />
              </div>
              <div className="input-group password-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" placeholder="Password"
                  value={form.password} onChange={handleChange} required minLength={6} />
                <span onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="input-group password-group">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword" placeholder="Re-enter Password"
                  value={form.confirmPassword} onChange={handleChange} required />
                <span onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
            <p className="or-text">Or Sign up with</p>
            <div className="social-btns">
              <button className="social-btn"><FaGoogle /></button>
              <button className="social-btn"><FaApple /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register