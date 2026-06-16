// backend/utils/response.js
// Consistent JSON response shapes across all controllers.

export const ok      = (res, data, status = 200)  => res.status(status).json({ success: true,  ...data });
export const created = (res, data)                 => ok(res, data, 201);
export const fail    = (res, message, status = 400)=> res.status(status).json({ success: false, error: message });
export const notFound= (res, message = "Not found")=> fail(res, message, 404);
export const serverError = (res, err) => {
  console.error("[500]", err?.message || err);
  res.status(500).json({ success: false, error: "Internal server error" });
};
