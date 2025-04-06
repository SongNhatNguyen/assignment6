const express = require("express");
const path = require("path");
const projectData = require("./modules/project.js");
const authData = require("./modules/auth-service.js");
const clientSessions = require("client-sessions");
const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

const PORT = process.env.PORT || 8000;

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

app.use(clientSessions({
  cookieName: "session", 
  secret: "longRandomStringForEncryptingSession", 
  duration: 2 * 60 * 1000, 
  activeDuration: 1000 * 60 
}));

app.use((req, res, next) => {
  res.locals.timestamp = new Date().toLocaleString(); 
  next();
});

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

const studentName = "Song Nhat Nguyen";
const studentId = "169284239";

projectData
  .initialize()
  .then(authData.initialize) 
  .then(() => {
    console.log("Project data initialized successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize project data:", error);
    process.exit(1);
  });

  function ensureLogin(req, res, next) {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    next();
  }  
  
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/solutions/projects", async function (req, res) {
  try {
    let sector = null;
    let projects = [];

    if (req.query.sector) {
      sector = req.query.sector.trim();
      projects = await projectData.getProjectsBySector(sector);

      if (projects.length === 0) {
        return res.status(404).render("404", {
          message: "Unable to find requested project.",
          studentName: studentName,
          studentId: studentId,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      projects = await projectData.getAllProjects();
    }

    res.render("projects", { projects: projects, sector: sector });
  } catch (error) {
    res.status(404).render("404", {
      message: "Unable to find requested project.",
      studentName: studentName,
      studentId: studentId,
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/solutions/projects/:id", async function (req, res) {
  try {
    let projectId = req.params.id;
    projectId = parseInt(projectId, 10);

    if (isNaN(projectId)) {
      return res.status(400).render("404", {
        message: "Unable to find requested project.",
        studentName: studentName,
        studentId: studentId,
        timestamp: new Date().toISOString(),
      });
    }

    let project = await projectData.getProjectById(projectId);

    if (!project) {
      return res.status(404).render("404", {
        message: "Unable to find requested project.",
        studentName: studentName,
        studentId: studentId,
        timestamp: new Date().toISOString(),
      });
    }

    res.render("details", { project: project });
  } catch (error) {
    res.status(404).render("404", {
      message: "Unable to find requested project.",
      studentName: studentName,
      studentId: studentId,
      timestamp: new Date().toISOString(),
    });
  }
});

app.post("/post-request", (req, res) => {
  res.json({
    studentName,
    studentId,
    timestamp: new Date().toISOString(),
  });
});

app.get("/solutions/addProject", ensureLogin, (req, res) => {
  projectData.getAllSectors()
    .then(sectors => {
      res.render("addProject", { sectors });
    })
    .catch(err => {
      res.render("500", { message: `Problem we encounterd: ${err}` });
    });
});

app.post("/solutions/addProject", ensureLogin, (req, res) => {
  projectData.addProject(req.body)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch(err => {
      res.render("500", { message: `Problem we encounterd: ${err}` });
    });
});

app.get("/solutions/editProject/:id", ensureLogin, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const [project, sectors] = await Promise.all([
      projectData.getProjectById(projectId),
      projectData.getAllSectors()
    ]);
    res.render("editProject", { project, sectors });
  } catch (err) {
    res.status(404).render("404", {
      message: err,
      studentName,
      studentId,
      timestamp: new Date().toISOString()
    });
  }
});

app.post("/solutions/editProject", ensureLogin, (req, res) => {
  const id = req.body.id;
  projectData.editProject(id, req.body)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("500", {
        message: `Problem we encounterd:${err}`
      });
    });
});

app.get("/solutions/deleteProject/:id", ensureLogin, (req, res) => {
  const id = parseInt(req.params.id);
  projectData.deleteProject(id)
    .then(() => res.redirect("/solutions/projects"))
    .catch(err => res.render("500", { message: `Problem we encounterd: ${err}` }));
});

app.get("/login", (req, res) => {
  res.render("login", {
    errorMessage: "",
    userName: ""
  });
});

app.get("/register", (req, res) => {
  res.render("register", {
    errorMessage: "",
    successMessage: "",
    userName: ""
  });
});

app.post("/register", (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render("register", {
        errorMessage: "",
        successMessage: "User created",
        userName: ""
      });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        successMessage: "",
        userName: req.body.userName
      });
    });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  authData.checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.render("login", {
        errorMessage: err,
        userName: req.body.userName
      });
    });
});

app.get("/logout", (req, res) => {
  req.session.reset();  
  res.redirect("/");    
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});


app.use((req, res) => {
  res.status(404).render("404", {
    message: "Unable to find requested project.",
    studentName,
    studentId,
    timestamp: new Date().toISOString(),
  });
});


