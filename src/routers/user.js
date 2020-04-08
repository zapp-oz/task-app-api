const express = require("express")
const multer = require("multer")
const sharp = require("sharp")
const users = require("./../models/users.js")
const authenticate = require("./../middleware/authenticate")
const {sendWelcomeMail, sendGoodbyeMail} = require("../email/account.js")

const router = new express.Router();

router.post("/users", async (req, res) => { 
    const user = new users(req.body);

    try{
        await user.save()
        sendWelcomeMail(user.email, user.name)
        const token = await user.generateWebTokens()
        res.status(201).send( {user, token} )
    }catch(e) {
        res.status(400).send(e)
    }
})

router.post("/users/login", async (req, res) => {

    try{
        const user = await users.findByCredentials(req.body.Email, req.body.password);

        const token = await user.generateWebTokens();

        res.status(200).send({user, token})
    } catch(e){
        res.status(400).send(e);
    }
})

router.get("/users/me", authenticate, async (req, res) => {
    res.send(req.user)
})

router.post("/users/logout", authenticate, async (req, res) => {

    try{
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
    
        await req.user.save();
        res.send()
    } catch(e){
        res.status(500).send()
    }
})

router.post("/users/logoutAll", authenticate, async(req, res) => {
    try{
        req.user.tokens = [];

        await req.user.save()
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }

})

//We don't need to fetch the users using their ids stored in the database
// router.get("/users/:id", async (req,res) => {
//     const _id = req.params.id;

//     try{
//         const user = await users.findById(_id);
        
//         if(!user){
//             return res.status(404).send();
//         }

//         res.send(user);
//     }catch(e){
//         res.status(500).send();
//     }

// })

router.patch("/users/:id", authenticate, async (req, res) => {

    const bodyKeys = Object.keys(req.body);
    const allowedUpdates = ["name", "age", "Email", "password"];
    const isValidUpdate = bodyKeys.every((key) => allowedUpdates.includes(key));

    if(!isValidUpdate){
        return res.status(400).send("Error: Invalid Updates");
    }

    try{
        const updatedUser = req.user
        
        bodyKeys.forEach((key) => {
            updatedUser[key] = req.body[key];
        })

        await updatedUser.save();
        
        //not required as if we were able to authenticate it means that we were able to find the user
        // if(!updatedUser){
        //     return res.status(404).send();
        // }

        res.send(updatedUser);
    }catch(e){
        res.status(400).send();
    }
})


router.delete("/users/me", authenticate, async (req, res) => {

    try{
        // const user = await users.findByIdAndDelete(req.params.id);
        
        // if(!user){
        //     return res.status(404).send();
        // }

        req.user.remove();
        sendGoodbyeMail(req.user.mail, req.user.name)
        res.send(req.user);
    }catch(e){
        res.status(500).send();
    }
})

const avatar = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){

        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("Please upload a .jpg, .jpeg or .png file!"))
        }

        cb(undefined, true);
    }
}) 

router.post("/users/me/avatar", authenticate, avatar.single("avatar"), async (req, res) => {
    try{
        const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
        req.user.avatar = buffer
        await req.user.save()
        res.send()
    } catch(e){
        res.status(500).send()
    }
}, (error, req, res, next) => {
    res.status(400).send({"Error": error.message})
})

router.delete("/users/me/avatar", authenticate, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get("/users/:id/avatar", async (req, res) => {
    
    try{
        const user = await users.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error();
        }

        res.set("Content-Type", "image/jpg")
        res.send(user.avatar)        

    } catch(e){
        res.status(404).send()
    }
})

module.exports = router
