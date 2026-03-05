import express from "express";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

import { acquireLock, releaseLock } from "./lock.js";
import { bookSeat } from "./seatService.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Ticket Booking System Running");
});

app.post("/api/book/:seatId", async (req, res) => {

  const seatId = req.params.seatId;
  const userId = uuidv4();

  const lockKey = `lock:seat:${seatId}`;
  const lockValue = uuidv4();

  const locked = await acquireLock(lockKey, lockValue);

  if (!locked) {
    return res.status(423).json({
      message: "Seat is currently locked"
    });
  }

  try {

    const result = await bookSeat(seatId, userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } finally {

    await releaseLock(lockKey, lockValue);

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});