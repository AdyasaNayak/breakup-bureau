import "dotenv/config";
import mongoose from "mongoose";
import Case from "./models/Case.js";

const sampleCases = [
  {
    partner: "Ankit",
    crime: "pretends he's single",
    damageLevel: "severe",
    compensation: "handwritten apology",
    status: "under investigation",
  },
  {
    partner: "Ankit",
    crime: "Treats me like I'm nothin but a piece of trash",
    damageLevel: "catastrophic",
    compensation: "needs to say sorry and do 500 sit-ups",
    status: "under investigation",
  },
  {
    partner: "Ady",
    crime: "blocks ankit when she gets angry",
    damageLevel: "mild",
    compensation: "1000 kisses from Ady",
    status: "solved",
  },
  {
    partner: "Ankit",
    crime: "Has become very comfortable in the relationship, doesn't put much effort",
    damageLevel: "catastrophic",
    compensation: "Needs to give princess treatment from now on",
    status: "under investigation",
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Case.deleteMany({});
  const created = await Case.insertMany(sampleCases);
  console.log(`Seeded ${created.length} NBIB cases`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});