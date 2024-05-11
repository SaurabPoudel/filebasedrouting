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

app.all("/*", async (req, res) => {
  let fileUrl = (ROOT_FOLDER + req.url).replace("//", "/");
  console.log(fileUrl);
  //TO DO use regex to support various extensions
  let isFile = fs.existsSync(fileUrl + ".js");

  if (!isFile) {
    fileUrl += "/index.js";
  } else {
    fileUrl += ".js";
  }

  let result = await handleRegularRoutes(fileUrl, req, res);
  if (result === false) {
    return res.send("Route Not Found");
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
