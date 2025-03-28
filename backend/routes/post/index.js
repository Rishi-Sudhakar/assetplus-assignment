const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Poster = require('../../models/Poster');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync('public/uploads', { recursive: true });
}

// Get all posters
router.get('/', async (req, res) => {
    try {
        const posters = await Poster.find().sort({ createdAt: -1 });
        res.json(posters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Upload a new poster
router.post('/', upload.single('image'), async (req, res) => {
    const imageUrl = `/uploads/${req.file.filename}`;
    const poster = new Poster({
        title: req.body.title,
        description: req.body.description,
        imageUrl: imageUrl,
        category: req.body.category,
        tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
        displayDate: req.body.displayDate || new Date()
    });

    try {
        const newPoster = await poster.save();
        res.status(201).json(newPoster);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Like a poster
router.post('/:id/like', async (req, res) => {
    try {
        const poster = await Poster.findById(req.params.id);
        if (!poster) {
            return res.status(404).json({ message: 'Poster not found' });
        }
        poster.likes += 1;
        const updatedPoster = await poster.save();
        res.json(updatedPoster);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add a comment to a poster
router.post('/:id/comment', async (req, res) => {
    try {
        const poster = await Poster.findById(req.params.id);
        if (!poster) {
            return res.status(404).json({ message: 'Poster not found' });
        }
        
        poster.comments.push({
            text: req.body.text,
            author: req.body.author
        });
        
        const updatedPoster = await poster.save();
        res.json(updatedPoster);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a poster
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const poster = await Poster.findById(req.params.id);
        if (!poster) {
            return res.status(404).json({ message: 'Poster not found' });
        }

        // If a new image is uploaded, delete the old one and update
        if (req.file) {
            // Delete old image if it exists
            const oldImagePath = path.join(__dirname, '../../public', poster.imageUrl);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            poster.imageUrl = `/uploads/${req.file.filename}`;
        }

        // Update other fields
        poster.title = req.body.title || poster.title;
        poster.description = req.body.description || poster.description;
        poster.category = req.body.category || poster.category;
        poster.tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : poster.tags;
        poster.displayDate = req.body.displayDate || poster.displayDate;

        const updatedPoster = await poster.save();
        res.json(updatedPoster);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a poster
router.delete('/:id', async (req, res) => {
    try {
        const poster = await Poster.findById(req.params.id);
        if (!poster) {
            return res.status(404).json({ message: 'Poster not found' });
        }

        // Delete the image file
        const imagePath = path.join(__dirname, '../../public', poster.imageUrl);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await poster.remove();
        res.json({ message: 'Poster deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;