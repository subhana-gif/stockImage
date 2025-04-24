import express from 'express'
import multer from 'multer'
import path from 'path'
import {
  uploadImages,
  getImages,
  editImage,
  deleteImage,
  rearrangeImages,
  replaceImage
} from '../controllers/image.controller'

const router = express.Router()

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({ storage })

router.post('/upload', upload.array('images'), uploadImages)
router.get('/:userId', getImages)
router.put('/edit/:id', upload.single('image'), editImage)
router.delete('/:id', deleteImage)
router.put('/rearrange', rearrangeImages)
router.put('/replace/:id', upload.single('image'), replaceImage)

export default router