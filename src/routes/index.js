import  { Router } from "express";
import casesRouter from "./cases.js";


const router = Router();

router.get("/", (req, res) => {
    res.json({
        message: "National Breakup Investigation Bureau is open for complaints",
    });
});

router.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "NBIB API",
    });
});

router.use("/cases", casesRouter);

export default router;