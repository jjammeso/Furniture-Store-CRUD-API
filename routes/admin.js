const express = require('express')
const admin = require('../models/admin')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Product = require('../models/product')


router.post('/login', (req, res) => {
    console.log(req.body)
    console.log('admin below',admin)

    if (!req.body.username || !req.body.password) res.json({ success: false, message: "Please enter password and username" })
    else {
        if (req.body.username === admin.username) {
            if (req.body.password === admin.password) {
                const token = jwt.sign(admin, 'secret_admin')
                res.json({ success: true, token })
            } else {
                res.json({ success: false, message: 'Incorrect password' })
            }
        } else {
            res.json({ success: false, message: 'Incorrect Username' })
        }
    }
})

const fetchAdmin = (req, res, next) => {
    const token = req.header('admin-token')

    if(!token){
        return res.status(401).send('Unauthorized')
    }else{
        try{
            const data = jwt.verify(token, 'secret_admin')
            next()
        }catch(error){
            res.status(401).send({success:false, message: 'please authenticate'})
        }
    }
}

router.post('/addproduct', fetchAdmin, async (req, res) => {
    console.log('request reached', req.body)
    try {
        let product = await Product.findOne({ id: req.body.id });
        if (product) {
            res.json({ success: false, message: 'The product exist in the Inventory. You can only update it.' })
            return;
        } else {
            const product = new Product({
                id: req.body.id,
                name: req.body.name,
                description: req.body.description,
                image: req.body.image,
                category: req.body.category,
                new_price: req.body.new_price,
                old_price: req.body.old_price,
                stock: req.body.quantity
            });
            await product.save();
            console.log('saved');
            res.json({
                success: true,
                name: req.body.name
            })
        }
    } catch (error) {
        res.json({ Success: false, message: error });
    }

})

router.put('/update/:id', fetchAdmin, async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate({ id: req.params.id }, { $set: { stock: req.body.stock } }, { new: true })
        if (product) res.json({ success: true, message: 'Stock Updated' })
        else res.json({ success: false, message: 'Update failed' })
    } catch (error) {
        res.json({ success: false, message: error })
    }
})

router.delete('/deleteproduct', async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.body.id });
        res.json({ Succeess: true })
    } catch (error) {
        res.json({ success: false, message: error })
    }
})

module.exports = router

