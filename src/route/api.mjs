import express from "express";
import { register, check } from "../auth.js";

const router = express.Router();
// router.use(express.json());

router.post("/username", check);
router.post("/users", register);

export const authRouter = router;
