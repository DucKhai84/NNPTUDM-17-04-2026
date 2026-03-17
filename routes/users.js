var express = require("express");
var router = express.Router();
let userModel = require("../schemas/users");
const bcrypt = require("bcryptjs");
const jwt = require("../lib/jwt");

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Unauthorized");

    const decoded = jwt.verify(token);
    if (!decoded) throw new Error("Invalid Token");

    const user = await userModel.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (!user || !user.status) throw new Error("User not found or disabled");

    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ message: error.message });
  }
};

/* GET all users */
router.get("/", async function (req, res, next) {
  let result = await userModel.findMany({
    where: { status: true },
    include: { role: true },
  });
  res.send(result);
});

// router.get("/:id", async function (req, res, next) {
//   try {
//     let id = parseInt(req.params.id);
//     if (isNaN(id)) {
//       return res.status(400).send({ message: "Invalid ID format" });
//     }
//     let result = await userModel.findFirst({
//       where: { id: id, status: true },
//       include: { role: true },
//     });
//     if (result) {
//       res.send(result);
//     } else {
//       res.status(404).send({ message: "ID NOT FOUND" });
//     }
//   } catch (error) {
//     res.status(404).send({ message: error.message });
//   }
// });

router.post("/", async function (req, res, next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    let newUser = await userModel.create({
      data: {
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        fullname: req.body.fullname,
        avatarUrl: req.body.avatarUrl,
        status: req.body.status,
        roleId: parseInt(req.body.roleId),
      },
    });
    res.send(newUser);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await userModel.findUnique({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ message: "Invalid username or password" });
    }

    if (!user.status) {
      return res.status(403).send({ message: "Account is disabled" });
    }

    const token = jwt.sign({ id: user.id, username: user.username });
    res.send({ token });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.get("/me", auth, async function (req, res, next) {
  const { password, ...userWithoutPassword } = req.user;
  res.send(userWithoutPassword);
});

router.post("/change-password", auth, async function (req, res, next) {
  try {
    const { oldpassword, newpassword } = req.body;

    // Validate new password
    if (!newpassword || newpassword.length < 6) {
      return res.status(400).send({ message: "New password must be at least 6 characters long" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldpassword, req.user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Incorrect old password" });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newpassword, salt);

    await userModel.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.send({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.put("/:id", async function (req, res, next) {
  try {
    let id = parseInt(req.params.id);
    let payload = { ...req.body };
    if (payload.roleId) payload.roleId = parseInt(payload.roleId);

    let updatedItem = await userModel.update({
      where: { id: id },
      data: payload,
    });
    res.send(updatedItem);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    let id = parseInt(req.params.id);
    let updatedItem = await userModel.update({
      where: { id: id },
      data: { status: false },
    });
    res.send(updatedItem);
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

router.post("/enable", async function (req, res, next) {
  try {

    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).send({
        message: "Email and username are required"
      });
    }

    // tìm user
    const user = await userModel.findFirst({
      where: {
        email: email,
        username: username
      }
    });

    if (!user) {
      return res.status(404).send({
        message: "USER NOT FOUND"
      });
    }

    // update status
    const updatedUser = await userModel.update({
      where: { id: user.id },
      data: {
        status: true
      }
    });

    res.status(200).send({
      message: "User enabled successfully",
      data: updatedUser
    });

  } catch (error) {
    res.status(400).send({
      message: error.message
    });
  }
});

router.post("/disable", async function (req, res, next) {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).send({
        message: "Email and username are required"
      });
    }

    // tìm user
    const user = await userModel.findFirst({
      where: {
        email: email,
        username: username
      }
    });

    if (!user) {
      return res.status(404).send({
        message: "USER NOT FOUND"
      });
    }

    // update status
    const updatedUser = await userModel.update({
      where: { id: user.id },
      data: {
        status: false
      }
    });

    res.status(200).send({
      message: "User disabled successfully",
      data: updatedUser
    });

  } catch (error) {
    res.status(400).send({
      message: error.message
    });
  }
});

router.get("/role/id/users/:roleId", async function (req, res, next) {
  try {
    const roleId = parseInt(req.params.roleId);
    const user = await userModel.findFirst({
      where: {
        roleId: roleId
      }
    });
    if (!user) {
      return res.status(404).send({
        message: "USER NOT FOUND"
      });
    }
    res.status(200).send({
      message: "User found successfully",
      data: user
    });
  } catch (error) {
    res.status(400).send({
      message: error.message
    });
  }
});

module.exports = router;
