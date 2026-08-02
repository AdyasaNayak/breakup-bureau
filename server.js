import express from "express";

const app = express();

const PORT =3000;

app.get("/", (req, res) =>{
  res.json({
    message: "National Breakup Investigation Bureau is open for complaints."
  });
});

app.listen(PORT, () => {
  console.log(`NBIB server running on http://localhost:${PORT}`);
});
