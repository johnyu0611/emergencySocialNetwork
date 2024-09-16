import express from "express";
import { register, authenticateJWT } from "../auth.js";

const router = express.Router();
// router.use(express.json());

router.post('/users', register);

export const authRouter = router;
