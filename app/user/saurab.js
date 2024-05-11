export const handler = (req, res) => {
  if (req.method === "GET") {
    console.log("It was get");
  }
  if (req.method === "POST") {
    console.log("It was post");
  }
  return "User Saurab";
};
