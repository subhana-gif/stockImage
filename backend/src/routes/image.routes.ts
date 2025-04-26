import express from 'express'
import multer from 'multer'
import {
  uploadImages,
  getImages,
  editImage,
  deleteImage,
  rearrangeImages,
  replaceImage
} from '../controllers/image.controller'
import verifyToken from '../middlewares/authmiddlewae'

const router = express.Router()

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({ storage })

router.post('/upload', verifyToken,upload.array('images'), uploadImages)
router.get('/:userId', verifyToken,getImages)
router.put('/edit/:id',verifyToken, upload.single('image'), editImage)
router.delete('/:id', verifyToken,deleteImage)
router.put('/rearrange', verifyToken,rearrangeImages)
router.put('/replace/:id',verifyToken, upload.single('image'), replaceImage)

export default router