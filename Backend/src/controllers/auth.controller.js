const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const foodpartnerModel = require("../models/foodpartner.model");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { fullName, email, password } = req.body;
  const isUserAlreadyExists = await userModel.findOne({
    email,
  });

  if (isUserAlreadyExists) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.create({
    fullName,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "User register successfully",
    user: {
      _id: user.id,
      email: user.email,
      fullName: user.fullName,
    },
  });
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({
      message: "invalid Email or password",
    });
  }
  const token = jwt.sign(
    {
      id: user._id,
    },
    "a87f67a3f44e5a317142a28dc7307da0"
  );

  res.cookie("token", token);
  res.status(200).json({
    message: "Uesr logged in successfully",
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
};

exports.logoutUser = async (req, res) => {
  res.clearCookies("token");
  res.status(200).json({ message: "User logged out successfully" });
};

exports.registerFoodPartner = async (req, res) => {
  const { name, email, password } = req.body;
  const isAccountAlreadyExists = await foodpartnerModel.findOne({ email });
  if (isAccountAlreadyExists) {
    res.status(400).json({ message: "Account already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const foodPartner = await foodpartnerModel.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign(
    {
      id: foodPartner._id,
    },
    process.env.JWT_SECRET
  );

  res.cookie("token", token);
  res.status(201).json({
    message: "Food partner registered succeddfully",
    foodPartner: {
      _id: foodPartner._id,
      email: foodPartner.email,
      name: foodPartner.name,
    },
  });
};

exports.loginFoodpartner = async (req, res) => {
  const { email, password } = req.body;
  const foodPartner = await foodpartnerModel.findOne({ email });
  if (!foodPartner) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const isPasswordValid = await bcrypt.compare(password, foodPartner.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign(
    {
      id: foodPartner._id,
    },
    process.env.JWT_SECRET
  );

  res.cookie("token", token);
  res.status(200).json({
    message: "Food partner logged in successfully",
    foodPartner: {
      _id: foodPartner._id,
      email: foodPartner.email,
      name: foodPartner.name,
    },
  });
};

exports.logoutFoodpartner = async (req, res) => {
  res.clearCookies("token");
  res.status(200).json({ message: "Food partner logged out successfully" });
};
