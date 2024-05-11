import express from "express";
import fs from "fs";

const app = express();
const ROOT_FOLDER = "./app/";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function handleRegularRoutes(fileUrl, req, res) {
  try {
    const module = await import(fileUrl);
    let data = null;
    const httpVerb = req.method.toLowerCase();

    if (module[httpVerb]) {
      console.log("inside if");
      data = module[httpVerb](req, res);
    } else {
      data = module.handler(req, res);
    }
    return data;
  } catch (e) {
    res.statusCode = 404;
    return false;
  }
}

async function handleDynamicRoutes(folder) {
  try {
    const files = await fs.promises.readdir(folder);

    const dynamicFileName = files.find((fname) => {
      return fname.match(/\[[a-zA-Z0-9\._]+\]/);
    });
    return {
      file: dynamicFileName,
      param: dynamicFileName.replace("[", "").replace("].js", ""),
    };
  } catch (e) {
    console.log(e);
    return null;
  }
}

app.all("/*", async (req, res) => {
  let fileUrl = (ROOT_FOLDER + req.url).replace("//", "/");

  //TO DO use regex to support various extensions
  let isFile = fs.existsSync(fileUrl + ".js");

  if (!isFile) {
    fileUrl += "/index.js";
  } else {
    fileUrl += ".js";
  }

  console.log(fileUrl);

  let result = await handleRegularRoutes(fileUrl, req, res);
  if (result === false) {
    // return res.send("Route Not Found");
    const pathArray = (ROOT_FOLDER + req.url).replace("//", "/").split("/");
    const lastElement = pathArray.pop();
    const folderToCheck = pathArray.join("/");
    const dynamicHandler = await handleDynamicRoutes(folderToCheck);

    if (!dynamicHandler) {
      return res.send("Route not found");
    }
    // req.params[dynamicHandler.param] = lastElement overrides every single params
    req.params = { ...req.params, [dynamicHandler.param]: lastElement };

    result = await handleRegularRoutes(
      [folderToCheck, dynamicHandler.file].join("/"),
      req,
      res
    );

    res.send(result);
  } else {
    return res.send(result);
  }
});

app.get("/", (req, res) => {
  return res.end("Received get http method");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
