import { Router } from "express";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const username = req.body?.username || req.body?.email || "admin";

  return res.json({
    token: "mock-jwt-token-12345",
    user: {
      id: "1",
      username: username,
      email: `${username}@school.com`,
      name: "Class Teacher",
      role: "admin"
    }
  });
});

// GET /api/auth/me
router.get("/me", async (_req, res) => {
  return res.json({
    id: "1",
    username: "admin",
    name: "Class Teacher",
    role: "admin"
  });
});

export default router;
