import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Log form data to make sure the form is submitted correctly
    console.log('Form Submitted:', { email, password })

    try {
      // Make the login request
      const response = await axios.post('http://stockimage.duckdns.org/api/users/login', { email, password })

      // Log the response to check if the token is in the response
      console.log('Login Response:', response.data)

      // Check if token exists and navigate
      if (response.data && response.data.token) {
        console.log('Login Successful, Token:', response.data.token) // Log the token

        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userId', response.data.id)  

        // Navigate to the dashboard
        navigate('/dashboard')
      } else {
        console.error('No token received in the response')
      }
    } catch (error) {
      console.error('Login failed', error)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl shadow-lg bg-white">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="w-full bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
        >
          Register
        </button>
        <p className="text-sm text-right">
  <button
    type="button"
    className="text-blue-600 hover:underline"
    onClick={() => navigate('/forgot-password')}
  >
    Forgot Password?
  </button>
</p>

      </form>
    </div>
  )
}

export default Login
