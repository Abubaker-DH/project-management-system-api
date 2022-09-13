const express = require("express");
const additionalNeeds = require("../routes/additionalNeeds");
const projects = require("../routes/projects");
const tasks = require("../routes/tasks");
const users = require("../routes/users");
const teams = require("../routes/teams");
const auth = require("../routes/auth");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/v1/additional-needs", additionalNeeds);
  app.use("/api/v1/projects", projects);
  app.use("/api/v1/users", users);
  app.use("/api/v1/tasks", tasks);
  app.use("/api/v1/teams", teams);
  app.use("/api/v1/auth", auth);
  app.use(error);
};
