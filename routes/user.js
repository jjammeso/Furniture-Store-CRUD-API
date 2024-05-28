const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const Users = require('../models/user')

router.post('/signup', async (req, res) => {
    const check = await Users.findOne({ email: req.body.email })

    if (check) {
        return res.status(400).json({ success: false, message: "Existing User" })
    }
    const cart = {};

    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }

    const user = new Users({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    })

    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }

    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token });
})

router.post('/login', async (req, res) => {
    const user = await Users.findOne({ email: req.body.email });

    if (user) {
        const passwordCompare = req.body.password === user.password;

        if (passwordCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            return res.json({ success: true, token })
        } else {
            return res.json({ success: false, message: "Incorrect Password" });
        }
    } else {
        return res.json({ success: false, message: "User not found" });
    }
})

//Cart 
const fetchUser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send('Please authenticate using validation')
    } else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({errors: "please authenticat using a correct token"});
        }
    }
}

router.post('/addtocart', fetchUser, async (req, res) => {
    let user = await Users.findByIdAndUpdate({_id:req.user.id});
    user.cartData[req.body.id] += 1;
    await Users.findOneAndUpdate({_id:req.user.id}, {cartData:user.cartData});
    res.json('Added');
})

router.delete('/removefromcart', fetchUser, async (req, res) => {
    let user = await Users.findByIdAndUpdate({_id:req.user.id});
    if(user.cartData[req.body.id]>0)
    user.cartData[req.body.id] -= 1;

    await Users.findOneAndUpdate({_id:req.user.id}, {cartData:user.cartData});
    res.json('Removed');
})

router.post('/cart', fetchUser, async(req,res) => {
    console.log('logged in for car',req.user.id)
    let user = await Users.findOne({_id: req.user.id});
    res.json(user.cartData);
})


module.exports = router
