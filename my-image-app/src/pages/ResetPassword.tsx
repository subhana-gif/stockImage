import { useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const ResetPassword = () => {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("token:",token)
    e.preventDefault()
    try {
      const response = await axios.post(`http://3.80.152.15/api/users/reset-password/${token}`, { password })
      setMessage(response.data.message)
    } catch (err) {
      console.log("error:",err)
      setMessage('Error resetting password.')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded bg-white">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded mb-4"
        />
        <button className="w-full bg-green-600 text-white py-2 rounded">Reset Password</button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  )
}

export default ResetPassword
