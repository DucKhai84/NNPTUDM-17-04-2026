var express = require("express");
var router = express.Router();
let categoryModel = require("../schemas/categories"); //dbContext
const { default: slugify } = require("slugify");

/* GET all categories */
router.get("/", async function (req, res, next) {
  let result = await categoryModel.findMany({
    where: { isDeleted: false },
  });
  res.send(result);
});

router.get("/:id", async function (req, res, next) {
  try {
    let id = parseInt(req.params.id);
    let result = await categoryModel.findFirst({
      where: { isDeleted: false, id: id },
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
  let newCate = await categoryModel.create({
    data: {
      name: req.body.name,
      slug: slugify(req.body.name, {
        replacement: "-",
        remove: undefined,
        lower: true,
        strict: false,
      }),
    },
  });
  res.send(newCate);
});
router.put("/:id", async function (req, res, next) {
  try {
    let id = req.params.id;
    //c1
    // let result = await categoryModel.findOne({
    //   isDeleted: false,
    //   _id: id
    // })
    // if (result) {
    //   let keys = Object.keys(req.body);
    //   for (const key of keys) {
    //     result[key] = req.body[key]
    //   }
    //   await result.save()
    //   res.send(result)
    // }
    // else {
    //   res.status(404).send({ message: "ID NOT FOUND" });
    // }
    let updatedItem = await categoryModel.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.send(updatedItem);
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    let id = parseInt(req.params.id);
    let updatedItem = await categoryModel.update({
      where: { id: id },
      data: { isDeleted: true },
    });
    res.send(updatedItem);
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

module.exports = router;
