import express from "express";
import dotenv from "dotenv";

import { acquireLock, releaseLock } from "./lock.js";
import { bookSeat } from "./seatService.js";
import redis from "./redis.js";

dotenv.config();

const app = express();
app.use(express.json());

/*
Home Route
*/
app.get("/", (req, res) => {
  res.send("Ticket Booking System Running");
});


/*
Book Seat API
Example:
POST /api/book/A1
*/
app.post("/api/book/:seatId", async (req, res) => {

  const seatId = req.params.seatId;

  const lockKey = `lock:${seatId}`;
  const lockValue = Date.now().toString();

  const locked = await acquireLock(lockKey, lockValue);

  if (!locked) {
    return res.status(423).json({
      message: "Seat is currently locked"
    });
  }

  try {

    const result = await bookSeat(seatId, "user");

    res.json(result);

  } finally {

    await releaseLock(lockKey, lockValue);

  }

});


/*
Check Seat Availability
Example:
GET /api/seats
*/
app.get("/api/seats", async (req, res) => {

  const seats = ["A1", "A2", "A3", "A4"];
  const result = {};

  for (const seat of seats) {

    const booked = await redis.get(`seat:${seat}`);

    if (booked) {
      result[seat] = "booked";
    } else {
      result[seat] = "available";
    }

  }

  res.json(result);

});


/*
Start Server
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});