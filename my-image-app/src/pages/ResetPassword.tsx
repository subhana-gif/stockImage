import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    
    try {
      const response = await axios.post(`https://stockimage.duckdns.org/api/users/reset-password/${token}`, { password })
      setMessage(response.data.message || 'Password reset successfully!')
      
      // Redirect to login page after success
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err) {
      console.log("error:", err)
      setError('Error resetting password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const navigateToLogin = () => {
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-8 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-6 text-purple-800 text-center">Reset Your Password</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
            minLength={8}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
            minLength={8}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-md font-medium transition duration-200 ease-in-out flex justify-center"
        >
          {loading ? 'Processing...' : 'Reset Password'}
        </button>
      </form>
      
      {error && <p className="mt-4 text-center text-red-600">{error}</p>}
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
      
      <div className="mt-6 text-center">
        <button 
          onClick={navigateToLogin}
          className="text-purple-600 hover:text-purple-800 font-medium"
        >
          Return to Login
        </button>
      </div>
    </div>
  )
}

export default ResetPassword