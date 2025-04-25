import { useState } from 'react'
import axios from 'axios'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post('https://stockimage.duckdns.org/api/users/forgot-password', { email })
      setMessage(response.data.message)
    } catch (err) {
      setMessage('Error sending reset link.')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded bg-white">
      <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded mb-4"
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded">Send Reset Link</button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  )
}

export default ForgotPassword
