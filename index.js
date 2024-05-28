require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const PORT = 4000;
const express = require('express')
const multer = require('multer')
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose')
const app = express();

app.use(express.json());
app.use(cors());

const productRouter = require('./routes/product')
const userRouter = require('./routes/user')
app.use('/product', productRouter)
app.use('/user', userRouter)

app.get('/', (req, res) => {
    res.send('Express APP is running')
})

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET 
});

const upload = multer({ storage: multer.memoryStorage() })

//Creating Upload Endpoint for Images
app.use('/images', express.static('upload/images'));


app.post('/upload', upload.single('product'), async (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }

     try {
        // Upload file buffer to Cloudinary
        const result = await cloudinary.uploader.upload_stream({
            resource_type: 'image'  
        }, (error, result) => {
            if (result) {
                res.json({
                    success: 1,
                    image_url: result.secure_url
                });
            } else {
                console.error(error);
                res.status(500).json({
                    success: 0,
                    message: 'Failed to upload image'
                });
            }
        }).end(req.file.buffer);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: 0,
            message: 'Failed to upload image'
        });
    }
}
)

//Connection to Database
async function main() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("connected to the database successfully")
    } catch (err) {
        console.error('Database connection failed', err);
        throw err;
    }
}

main().then(() => {
    app.listen(PORT, (error) => {
        if (!error) console.log('server is listening on PORT:', PORT);
        else console.log('Error:', error)
    })
}).catch(err => console.log(err))
