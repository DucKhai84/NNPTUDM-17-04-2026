var express = require("express");
var router = express.Router();
const prisma = require("../lib/prisma");

router.get("/", async function (req, res, next) {
    try {
        let result = await prisma.inventory.findMany({
            include: { product: true }
        });
        res.send({ success: true, data: result });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

router.get("/:id", async function (req, res, next) {
    try {
        let id = parseInt(req.params.id);
        let result = await prisma.inventory.findUnique({
            where: { id: id },
            include: { product: true }
        });
        if (result) {
            res.send({ success: true, data: result });
        } else {
            res.status(404).send({ success: false, message: "Inventory not found" });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

router.post("/add-stock", async function (req, res, next) {
    try {
        const { productId, quantity } = req.body;
        const pId = parseInt(productId);
        const qCount = parseInt(quantity);
        const result = await prisma.inventory.upsert({
            where: { productId: pId },
            update: {
                stock: { increment: qCount }
            },
            create: {
                productId: pId,
                stock: qCount
            }
        });
        res.send({ success: true, data: result });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

router.post("/remove-stock", async function (req, res, next) {
    try {
        const { productId, quantity } = req.body;
        const pId = parseInt(productId);
        const qCount = parseInt(quantity);

        const result = await prisma.$transaction(async (tx) => {
            const inv = await tx.inventory.findUnique({
                where: { productId: pId }
            });

            if (!inv || inv.stock < qCount) {
                throw new Error(`Not enough stock. Current stock: ${inv ? inv.stock : 0}`);
            }

            return await tx.inventory.update({
                where: { productId: pId },
                data: { stock: { decrement: qCount } }
            });
        });

        res.send({ success: true, data: result });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

router.post("/reservation", async function (req, res, next) {
    try {
        const { productId, quantity } = req.body;
        const pId = parseInt(productId);
        const qCount = parseInt(quantity);

        const result = await prisma.$transaction(async (tx) => {
            const inv = await tx.inventory.findUnique({
                where: { productId: pId }
            });

            if (!inv || inv.stock < qCount) {
                throw new Error(`Not enough stock for reservation. Available: ${inv ? inv.stock : 0}`);
            }

            return await tx.inventory.update({
                where: { productId: pId },
                data: {
                    stock: { decrement: qCount },
                    reserved: { increment: qCount }
                }
            });
        });

        res.send({ success: true, data: result });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

router.post("/sold", async function (req, res, next) {
    try {
        const { productId, quantity } = req.body;
        const pId = parseInt(productId);
        const qCount = parseInt(quantity);

        const result = await prisma.$transaction(async (tx) => {
            const inv = await tx.inventory.findUnique({
                where: { productId: pId }
            });

            if (!inv || inv.reserved < qCount) {
                throw new Error(`Not enough reserved stock to sell. Reserved: ${inv ? inv.reserved : 0}`);
            }

            return await tx.inventory.update({
                where: { productId: pId },
                data: {
                    reserved: { decrement: qCount },
                    soldCount: { increment: qCount }
                }
            });
        });

        res.send({ success: true, data: result });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

module.exports = router;
