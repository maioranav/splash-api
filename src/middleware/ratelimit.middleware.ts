import setRateLimit from "express-rate-limit";

// Rate limit middleware
export const rateLimitMiddleware = setRateLimit({
   windowMs: 60 * 1000,
   max: 30,
   message: { message: "You have reached the max requests allowed limit." },
   headers: true
});
