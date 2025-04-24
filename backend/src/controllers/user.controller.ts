import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user.model'
import crypto from 'crypto'
import nodemailer from 'nodemailer'


export const registerUser = async (req: Request, res: Response) : Promise<void> => {
  try {
    const { email, phone, password } = req.body
    const existingUser = await User.findOne({ email })
    if (existingUser) 
        
    res.status(400).json({ message: 'User already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ email, phone, password: hashedPassword })
    await newUser.save()

    res.status(201).json({ message: 'User registered successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body
      const user = await User.findOne({ email })
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' }) 
      }
      
      const isMatch = await bcrypt.compare(password, user.password)
      
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' }) 
      }
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1d' })
      return res.json({ token,id:user._id})
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Server error' })
    }
  }
  
  
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'subhanathasni@gmail.com',
      pass: 'pkserdlpjeljidjz',
    },
  })
  
  export const forgotPassword = async (req: Request, res: Response): Promise<void>  => {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })
  
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1d' })
    console.log("token:",token)
    await user.save()
  
    const resetLink = `https://stockimage.duckdns.org/reset-password/${token}`
  
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
    })
  
    res.json({ message: 'Reset link sent to email' })
  }
  
  export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params
  const { password } = req.body

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
    const user = await User.findById(decoded.id)
    console.log("JWT_SECRET:", process.env.JWT_SECRET)
    console.log("Token:", token)

    if (!user) {
      return res.status(400).json({ message: 'Invalid token or user not found' })
    }

    user.password = await bcrypt.hash(password, 10)
    await user.save()

    res.status(200).json({ message: 'Password reset successfully' })
  } catch (error) {
    console.log("error reset:",error)
    return res.status(400).json({ message: 'Invalid or expired token' })
  }
}
