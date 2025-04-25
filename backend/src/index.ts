import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import userRoutes from './routes/user.routes'
import imageRoutes from './routes/image.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use(cors({
  origin: ['http://localhost:5173',  "https://stockimage.duckdns.org",],
    credentials: true
  }))

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Routes
app.use('/api/users', userRoutes)
app.use('/api/images', imageRoutes)

mongoose
  .connect(process.env.MONGO_URI || '', {
    dbName: 'image_app'
  })
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => console.error('MongoDB connection error:', err))