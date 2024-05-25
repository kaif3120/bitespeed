import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import ContactModel from "./models/contact";
import { sequelize } from "./models/";
import identifyRouter from './routes/identifyRoute';
import swaggerUi from "swagger-ui-express"
import YAML from "yamljs"; 
import cors from 'cors';

// Import routes and helpers
const swaggerDocument = YAML.load("./swagger.yaml");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Enable CORS for all routes
app.use(cors({ origin: "*" }));

// Use the contactRouter for /contacts requests
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/identify', identifyRouter);


app.get("/syncDB", (req: Request, res: Response, next: NextFunction) => {
  if ((process.env.NODE_ENV || "development") === "development") {
    return sequelize
      .authenticate()
      .then(() =>
        ContactModel.sync({
          force: false,
        })
      )
      .then(() => {
        res.send("Synced Database");
      })
      .catch((err: any) => {
        console.log(err);
        res.status(500).send(err);
      });
  }
  return res.send("Not allowed");
});
// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new Error("Not Found");
  next(err);
});
// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // set locals, only providing error in development
  console.log(err)
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500).send(err);
});

const port = process.env.PORT || 3000; // Use environment variable PORT if available, otherwise default to 3000

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
