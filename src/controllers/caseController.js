import Case from "../models/Case.js";

export async function createCase(req, res, next) {
  try {
    const newCase = await Case.create(req.body);
    res.status(201).json(newCase);
  } catch (error) {
    next(error);
  }
}

export async function getCases(req, res, next) {
  try {
    const cases = await Case.find().sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    next(error);
  }
}

export async function getCaseById(req, res, next) {
  try {
    const found = await Case.findById(req.params.id);
    if (!found) {
      return res.status(404).json({ message: "Case not found" });
    }
    res.json(found);
  } catch (error) {
    next(error);
  }
}

export async function updateCase(req, res, next) {
  try {
    const updated = await Case.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Case not found" });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteCase(req, res, next) {
  try {
    const deleted = await Case.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Case not found" });
    }
    res.json({ message: "Case closed and shredded", case: deleted });
  } catch (error) {
    next(error);
  }
}