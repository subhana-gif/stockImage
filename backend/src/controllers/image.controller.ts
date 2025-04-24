import { Request, Response } from 'express'
import Image from '../models/image.models'
import fs from 'fs'
import path from 'path'

export const uploadImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.body.userId;
    const files = req.files as Express.Multer.File[];
    const titles = Array.isArray(req.body.title) ? req.body.title : [req.body.title];

    if (files.length !== titles.length) {
      res.status(400).json({ message: 'Mismatch between number of images and titles' });
      return;
    }

    const images = files.map((file, index) => ({
      title: titles[index],
      imageUrl: `/uploads/${file.filename}`,
      userId: userId,
    }));

    const insertedImages = await Image.insertMany(images);

    // 👇 Return the inserted images instead of just a message
    res.status(201).json(insertedImages);
  } catch (err) {
    console.error("Error uploading:", err);
    res.status(500).json({ message: 'Upload error' });
  }
};
  
export const getImages = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId
    const images = await Image.find({ userId }).sort({ order: 1 })
    res.json(images)
  } catch (err) {
    res.status(500).json({ message: 'Fetch error' })
  }
}

export const editImage = async (req: Request, res: Response) => {
  try {
    const { title } = req.body
    const updateData: any = { title }
    if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`

    const updatedImage = await Image.findByIdAndUpdate(req.params.id, updateData, { new: true })
    res.json(updatedImage)
  } catch (err) {
    res.status(500).json({ message: 'Edit error' })
  }
}

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const image = await Image.findById(req.params.id)
    if (image) {
      const imagePath = path.join(__dirname, '../../uploads', path.basename(image.imageUrl))
      fs.unlinkSync(imagePath)
      await Image.findByIdAndDelete(req.params.id)
      res.json({ message: 'Image deleted' })
    } else {
      res.status(404).json({ message: 'Image not found' })
    }
  } catch (err) {
    res.status(500).json({ message: 'Delete error' })
  }
}

export const rearrangeImages = async (req: Request, res: Response) => {
  try {
    const { images } = req.body
    for (const { id, order } of images) {
      await Image.findByIdAndUpdate(id, { order })
    }
    res.json({ message: 'Images rearranged' })
  } catch (err) {
    res.status(500).json({ message: 'Rearrange error' })
  }
}

export const replaceImage = async (req: Request, res: Response) : Promise<void>=> {
  try {
    const image = await Image.findById(req.params.id)

    if (!image) {
      res.status(404).json({ message: 'Image not found' });
      return;
    }

    // Delete the old image file
    const oldImagePath = path.join(__dirname, '../../uploads', path.basename(image.imageUrl))
    fs.unlinkSync(oldImagePath)

    // Update with the new image file
    const newImageUrl = `/uploads/${req.file?.filename}`
    image.imageUrl = newImageUrl
    await image.save()

    res.json({ message: 'Image replaced successfully', imageUrl: newImageUrl })
  } catch (err) {
    console.error("Replace error:", err)
    res.status(500).json({ message: 'Replace error' })
  }
}
