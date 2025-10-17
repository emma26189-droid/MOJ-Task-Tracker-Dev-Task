import { Router, Request, Response } from "express";
import axios from "axios";
import { parseISO } from "date-fns";

const router = Router();
const API_BASE_URL = "http://localhost:4000/api/tasks";

interface ValidationError {
  text: string;
  href: string;
}

function logError(context: string, error: any) {
  if (error.response) {
    console.error(`${context} - API error:`, {
      status: error.response.status,
      data: error.response.data,
    });
  } else if (error.request) {
    console.error(`${context} - No response received:`, error.request);
  } else {
    console.error(`${context} - Unexpected error:`, error.message || error);
  }
}

// Display home page with tasks
router.get("/", async (req: Request, res: Response) => {
  try {
    const response = await axios.get(API_BASE_URL);
    res.render("home", { tasks: response.data });
  } catch (error) {
    logError("Fetching tasks", error);
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

    await axios.post(API_BASE_URL, { title, description, status, dueDate: formattedDate });
    res.redirect("/tasks");
  } catch (error) {
    logError("Creating task", error);
    res.render("home", {
      tasks: [],
      errors: [{ text: "Error creating task", href: "#" }],
      values: req.body,
    });
  }
});

// Edit task form
router.get("/:id/edit", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    const task = response.data;

    const d = parseISO(task.dueDate);
    const values = {
      ...task,
      "dueDate-day": d.getDate().toString(),
      "dueDate-month": (d.getMonth() + 1).toString(),
      "dueDate-year": d.getFullYear().toString(),
    };

    res.render("edit-task", { task, values });
  } catch (error) {
    logError("Loading task for edit", error);
    res.render("home", {
      tasks: [],
      errors: [{ text: "Error loading task", href: "#" }],
    });
  }
});

// Handle edit form submission
router.post("/:id/edit", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
      return res.render("edit-task", { errors, values: req.body, task: { id } });
    }

    await axios.put(`${API_BASE_URL}/${id}`, {
      title,
      description,
      status,
      dueDate: formattedDate,
    });

    res.redirect("/tasks");
  } catch (error) {
    logError("Updating task", error);
    res.render("edit-task", {
      errors: [{ text: "Error updating task", href: "#" }],
      values: req.body,
      task: { id: req.params.id },
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
    logError("Updating task status", error);
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
    logError("Deleting task", error);
    res.render("home", {
      tasks: [],
      errors: [{ text: "Error deleting task", href: "#" }],
    });
  }
});

// ✅ Default export for compatibility
export default router;