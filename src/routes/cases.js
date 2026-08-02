import { Router } from "express";
import {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
} from "../controllers/caseController.js";

const router = Router();

router.post("/", createCase);
router.get("/", getCases);
router.get("/:id", getCaseById);
router.put("/:id", updateCase);
router.delete("/:id", deleteCase);

export default router;