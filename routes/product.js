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

router.post('/addproduct', async (req, res) => {
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

router.put('/update/:id', async (req, res) => {
    const id = req.params.id
    console.log(req.body.stock, id)
    try {
        const product = await Product.findOneAndUpdate({id:id}, { $set: { stock: req.body.stock } }, {new:true})
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