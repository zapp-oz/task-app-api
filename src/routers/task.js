const express = require("express")
const tasks = require("./../models/tasks")
const authenticate = require("../middleware/authenticate.js")

const router = new express.Router()

router.post("/tasks", authenticate, async (req, res) => {

    //const task = new tasks(req.body);

    const task = new tasks({
        ...req.body,
        owner: req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task);
    }catch(e){
        res.status(400).send();
    }
})


router.get("/tasks", authenticate, async (req, res) => {

    const match = {}
    const sort = {}

    if(req.query.sortBy){
        const queryParams = req.query.sortBy.split("_")
        sort[queryParams[0]] = queryParams[1] === "desc" ? -1 : 1;
    }

    if(req.query.completed){
        match.completed = req.query.completed === "true"
    }

    try{
        //const task = await tasks.find({owner: req.user._id})
        
        await req.user.populate({
            path: "tasks",
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        
        res.send(req.user.tasks);
    }catch(e){
        res.status(500).send();
    }
})

router.get("/tasks/:id", authenticate, async (req, res) => {
    const _id = req.params.id;

    try{
        //const task = await tasks.findById(_id);

        const task = await tasks.findOne({_id, owner: req.user._id})

        if(!task){
            return res.status(404).send();
        }

        res.send(task);
    }catch(e){
        res.status(500).send();
    }
})


router.patch("/tasks/:id", authenticate, async (req, res) => {
    const bodyKeys = Object.keys(req.body);
    const validUpdates = ["description", "completed"];
    const isValidUpdate = bodyKeys.every((key) => validUpdates.includes(key));

    if(!isValidUpdate){
        return res.status(400).send("Error: Invalid Updates");
    }

    try{
        const updatedTask = await tasks.findOne({_id: req.params.id, owner: req.user._id})
        //const updatedTask = await tasks.findById(req.params.id);

        if(!updatedTask){
            return res.status(404).send();
        }

        bodyKeys.forEach((key) => {
            updatedTask[key] = req.body[key];
        })

        await updatedTask.save()

        res.send(updatedTask);
    }catch(e){
        res.status(400).send("err");
    }
})

router.delete("/tasks/:id", authenticate, async (req, res) => {

    try{
        const task = await tasks.findOneAndDelete({_id:req.params.id, owner: req.user._id});

        if(!task){
            return res.status(404).send();
        }

        res.send(task);
    }catch(e){
        res.status(500).send();
    }
})

module.exports = router