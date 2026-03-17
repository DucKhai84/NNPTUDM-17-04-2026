var express = require("express");
var router = express.Router();
let productModel = require("../schemas/products");
const prisma = require("../lib/prisma");
const slugify = require("slugify");

/* GET all products */
router.get("/", async function (req, res, next) {
  try {
    let result = await productModel.findMany({
      where: { isDeleted: false },
      include: { category: true }
    });
    res.send({ success: true, data: result });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

/* GET single product by ID */
router.get("/:id", async function (req, res, next) {
  try {
    let id = parseInt(req.params.id);
    let result = await productModel.findUnique({
      where: { id: id },
      include: { category: true }
    });
    if (result) {
      res.send({ success: true, data: result });
    } else {
      res.status(404).send({ success: false, message: "Product not found" });
    }
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

/* POST: Create a new product */
router.post("/", async function (req, res, next) {
  try {
    const { title, price, description, images, categoryId, stock } = req.body;

    // Validate stock
    const stockQuantity = parseInt(stock) || 0;
    if (stockQuantity < 0) {
      return res.status(400).send({ success: false, message: "Stock cannot be negative" });
    }

    const slug = slugify(title, { lower: true, strict: true });
    const imageList = Array.isArray(images) ? images : (images ? [images] : []);

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          title,
          slug,
          price: parseFloat(price) || 0,
          description,
          images: imageList,
          categoryId: parseInt(categoryId)
        }
      });

      await tx.inventory.create({
        data: {
          productId: product.id,
          stock: stockQuantity
        }
      });

      return product;
    });

    res.status(201).send({ success: true, data: result });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});



/* PUT: Update a product */
router.put("/:id", async function (req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { title, price, description, images, categoryId } = req.body;

    let updateData = {};
    if (price !== undefined) updateData.price = parseFloat(price);
    if (description !== undefined) updateData.description = description;
    if (images !== undefined) updateData.images = Array.isArray(images) ? images : [images];
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);

    if (title) {
      updateData.title = title;
      updateData.slug = slugify(title, { lower: true, strict: true });
    }

    const result = await productModel.update({
      where: { id: id },
      data: updateData
    });
    res.send({ success: true, data: result });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});


/* DELETE: Soft delete a product */
router.delete("/:id", async function (req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const result = await productModel.update({
      where: { id: id },
      data: { isDeleted: true }
    });
    res.send({ success: true, message: "Product deleted successfully", data: result });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

module.exports = router;

