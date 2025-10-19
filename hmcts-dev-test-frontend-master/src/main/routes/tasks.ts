import { Router, Request, Response } from "express";
import axios from "axios";
import { Task } from "../types/task";

const router = Router();
const API_BASE_URL = "http://localhost:4000/api/tasks";

interface ValidationError {
  text: string;
  href: string;
}

// Display home page with tasks
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, sort = "id", order = "asc" } = req.query;
    const response = await axios.get(API_BASE_URL);
    let tasks: Task[] = response.data;

    if (typeof status === "string" && status.trim()) {
      tasks = tasks.filter((task: Task) => task.status === status);
    }

    tasks.sort((a: Task, b: Task) => {
      const multiplier = order === "desc" ? -1 : 1;

      if (sort === "id") {
        return (a.id - b.id) * multiplier;
      } else if (sort === "dueDate") {
        return (
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        ) * multiplier;
      } else if (sort === "title") {
        return a.title.localeCompare(b.title) * multiplier;
      }

      return 0;
    });

    res.render("home", {
      tasks,
      query: { status, sort, order },
    });
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
    const day = req.body["dueDate-day"];
    const month = req.body["dueDate-month"];
    const year = req.body["dueDate-year"];

    const errors: ValidationError[] = [];
    if (!title) errors.push({ text: "Enter a title", href: "#title" });
    if (!status) errors.push({ text: "Select a status", href: "#status" });
    if (!day || !month || !year) {
      errors.push({ text: "Enter a valid due date", href: "#due-date" });
    }

    let formattedDate: string | null = null;
    if (day && month && year) {
      const parsedDate = new Date(+year, +month - 1, +day);
      if (isNaN(parsedDate.getTime())) {
        errors.push({ text: "Enter a valid due date", href: "#due-date" });
      } else {
        formattedDate = parsedDate.toISOString();
      }
    }

    if (errors.length > 0) {
      return res.render("home", { errors, tasks: [], values: req.body });
    }

    await axios.post(API_BASE_URL, {
      title,
      description,
      status,
      dueDate: formattedDate,
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