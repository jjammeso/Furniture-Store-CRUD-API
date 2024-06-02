const express = require('express')
const router = express.Router()
const Product = require('../models/product')

router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.send(products);
    } catch (error) {
        res.json({ success: false, message: error })
    }

})

router.get('/products/:id', async (req, res) => {
    const id = req.params.id
    try {
        const product = await Product.find({ id: id });
        if (product.length > 0) res.send(product);
        else res.json({ success: false, message: `No products with id: ${id}` })
    } catch (error) {
        res.json({ success: false, message: error })
    }
})

router.get('/newcollection', async (req, res) => {
    try {
        const products = await Product.find({});
        const newCollection = products.slice(1).slice(-8);
        res.json(newCollection);
    } catch (error) {
        res.json({ success: false, message: error })
    }
})


module.exports = router