import redis from "./redis.js";

export async function bookSeat(seatId, userId) {

  const seatKey = `seat:${seatId}`;

  const existing = await redis.get(seatKey);

  if (existing) {
    return {
      success: false,
      message: "Seat already booked"
    };
  }

  await redis.set(seatKey, userId);

  return {
    success: true,
    message: "Seat booked successfully"
  };
}