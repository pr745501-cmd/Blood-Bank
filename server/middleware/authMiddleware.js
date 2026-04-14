import jwt from "jsonwebtoken";

/* ================= VERIFY TOKEN ================= */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role }

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or Expired Token"
    });
  }
};

/* ================= ADMIN ONLY ================= */
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access Denied. Admin Only."
    });
  }

  next();
};
