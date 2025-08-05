const axios = require("axios");

// CONFIGURATION
const CONCURRENCY = 5; // number of parallel requests
const slotId = 15;
const BOOKING_URL = `http://localhost:3000/reservation/book-slot/${slotId}`; // replace with your endpoint
const AUTH_TOKEN = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hcnVmYW11a2FkYW02OTZAZ21haWwuY29tIiwiaXAiOiI6OjEiLCJpYXQiOjE3NTQzMTcwMDQsImV4cCI6MTc1NDMzNTAwNH0.zj4wxKZjk1dDrj882ExemXIN8RL56JwNb490RKct6ko",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hcnVmYTFAdHVwbWFpbC5jb20iLCJpcCI6Ijo6MSIsImlhdCI6MTc1NDMxNzAyNCwiZXhwIjoxNzU0MzM1MDI0fQ.INbgEkMOssDEcJ2CFH6BPEo--6fTy_kbmp-7C21IexY",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hcnVmYTJAdHVwbWFpbC5jb20iLCJpcCI6Ijo6MSIsImlhdCI6MTc1NDMxNzAzOSwiZXhwIjoxNzU0MzM1MDM5fQ.9nfybM10MtME-sjuKtEx0bhY4A36_82vf5ab4qYAxwk",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hcnVmYTNAdHVwbWFpbC5jb20iLCJpcCI6Ijo6MSIsImlhdCI6MTc1NDMxNzA1NCwiZXhwIjoxNzU0MzM1MDU0fQ.TT_vAwIe-lCSnZB2jnwa9rbZZoTD1QB-_967k6gYSFI",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hcnVmYTRAdHVwbWFpbC5jb20iLCJpcCI6Ijo6MSIsImlhdCI6MTc1NDMxNzA2NywiZXhwIjoxNzU0MzM1MDY3fQ.SVA1nbSAXf-NninSfzbaU2cN0slc5GO1sumh2JAMcaY",
];
async function bookSlot(i, token) {
  const start = Date.now(); // ✅ define start time here
  try {
    console.log(`Request ${i} started at ${new Date(start).toISOString()}`);

    const response = await axios.post(
      BOOKING_URL,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const end = Date.now(); // ✅ define end time after response
    console.log(
      `Request ${i} Success: ${response.data.message} | Duration: ${
        end - start
      }ms`
    );
  } catch (error) {
    const end = Date.now();
    console.error(
      `Request ${i} Failed: ${
        error.response?.data?.message || error.message
      } | Duration: ${end - start}ms`
    );
  }
}

async function runConcurrentBookings() {
  const promises = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    promises.push(bookSlot(i + 1, AUTH_TOKEN[i]));
  }

  await Promise.all(promises);
  console.log("✅ All requests completed");
}

runConcurrentBookings();
