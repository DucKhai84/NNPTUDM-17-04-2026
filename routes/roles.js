var express = require("express");
var router = express.Router();
let roleModel = require("../schemas/roles");

/* GET all roles */
router.get("/", async function (req, res, next) {
    let result = await roleModel.findMany();
    res.send(result);
});

router.get("/:id", async function (req, res, next) {
    try {
        let id = parseInt(req.params.id);
        let result = await roleModel.findFirst({
            where: { id: id },
        });
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "ID NOT FOUND" });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

router.post("/", async function (req, res, next) {
    try {
        let newRole = await roleModel.create({
            data: {
                name: req.body.name,
                description: req.body.description,
            },
        });
        res.send(newRole);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.put("/:id", async function (req, res, next) {
    try {
        let id = parseInt(req.params.id);
        let updatedItem = await roleModel.update({
            where: { id: id },
            data: req.body,
        });
        res.send(updatedItem);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.delete("/:id", async function (req, res, next) {
    try {
        let id = parseInt(req.params.id);
        let updatedItem = await roleModel.delete({
            where: { id: id },
        });
        res.send(updatedItem);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

module.exports = router;
