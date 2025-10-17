// src/main/routes/tasks.ts
import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();
const API_BASE_URL = "http://localhost:4000/api/tasks";

interface ValidationError {
  text: string;
  href: string;
}

// Display home page with tasks
router.get("/", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(API_BASE_URL);
    res.render("home", { tasks: response.data });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.render("home", {
      tasks: [],
      errors: [{ text: "Error loading tasks", href: "#" }],
    });
  }
});

// Create new task
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, description, status } = req.body;
    const { day, month, year } = req.body.dueDate || {};

    const errors: ValidationError[] = [];

    if (!title) {
      errors.push({ text: "Enter a title", href: "#title" });
    }
    if (!status) {
      errors.push({ text: "Select a status", href: "#status" });
    }
    if (!day || !month || !year) {
      errors.push({ text: "Enter a valid due date", href: "#due-date" });
    }

    if (errors.length > 0) {
      return res.render("home", {
        errors,
        tasks: [],
        values: req.body,
      });
    }

    const dueDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    ).toISOString();

    await axios.post(API_BASE_URL, {
      title,
      description,
      status,
      dueDate,
    });

    res.redirect("/tasks");
  } catch (error) {
    console.error("Error creating task:", error);
    res.render("home", {
      tasks: [],
      errors: [{ text: "Error creating task", href: "#" }],
      values: req.body,
    });
  }
});

// Update task status
router.post("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.render("home", {
        tasks: [],
        errors: [{ text: "Select a status", href: "#status" }],
      });
    }

    await axios.patch(`${API_BASE_URL}/${id}/status`, { status });
    res.redirect("/tasks");
  } catch (error) {
    console.error("Error updating task status:", error);
    res.render("home", {
      tasks: [],
      errors: [{ text: "Error updating task status", href: "#" }],
    });
  }
});

// Delete task
router.post("/:id/delete", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await axios.delete(`${API_BASE_URL}/${id}`);
    res.redirect("/tasks");
  } catch (error) {
    console.error("Error deleting task:", error);
    res.render("home", {
      tasks: [],
      errors: [{ text: "Error deleting task", href: "#" }],
    });
  }
});

export default router;