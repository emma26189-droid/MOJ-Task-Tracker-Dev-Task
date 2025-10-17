import * as path from "path";
import * as express from "express";
import * as nunjucks from "nunjucks";
import { format } from "date-fns";

export class Nunjucks {
  constructor(public developmentMode: boolean) {
    this.developmentMode = developmentMode;
  }

  enableFor(app: express.Express): void {
    app.set("view engine", "njk");

    // Capture the environment object
    const env = nunjucks.configure(path.join(__dirname, "..", "..", "views"), {
      autoescape: true,
      watch: this.developmentMode,
      express: app,
    });

    // ✅ Add a custom date filter
    env.addFilter("date", function (dateString: string, formatStr: string) {
      if (!dateString) return "";
      try {
        const d = new Date(dateString);
        return format(d, formatStr); // e.g. "d MMMM yyyy"
      } catch {
        return dateString;
      }
    });

    app.use((req, res, next) => {
      res.locals.pagePath = req.path;
      next();
    });
  }
}