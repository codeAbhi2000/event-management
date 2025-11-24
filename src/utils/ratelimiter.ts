import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

class InMemoryRateLimiter {
  private store: Map<string, RateLimitStore> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key);
      }
    }
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.getKey(req);
      const now = Date.now();
      
      let record = this.store.get(key);

      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + this.windowMs
        };
        this.store.set(key, record);
        this.setHeaders(res, record);
        return next();
      }

      if (record.count >= this.maxRequests) {
        this.setHeaders(res, record);
        return res.status(429).json({
          error: "Too many requests",
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        });
      }

      record.count++;
      this.setHeaders(res, record);
      next();
    };
  }

  private getKey(req: Request): string {
    // Use IP address as key (you can customize this)
    return req.ip || req.socket.remoteAddress || "unknown";
  }

  private setHeaders(res: Response, record: RateLimitStore) {
    const remaining = Math.max(0, this.maxRequests - record.count);
    const resetTime = Math.ceil(record.resetTime / 1000);
    
    res.setHeader("X-RateLimit-Limit", this.maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetTime);
  }
}

// Usage example:
export const rateLimiter = new InMemoryRateLimiter(
  60000,  // 1 minute window
  100     // 100 requests per window
);

