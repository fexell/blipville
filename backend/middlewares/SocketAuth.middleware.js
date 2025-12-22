import AuthMiddleware from "./Auth.middleware.js";

export async function socketAuth(socket, next) {
  try {
    const req = socket.request;

    // copy cookies parsed earlier
    // ensure token exists in cookie/header
    req.userId = socket.userId;

    // run required checks in correct order
    await AuthMiddleware.ValidateTokens(req);
    await AuthMiddleware.VerifySessionData(req);
    await AuthMiddleware.RefreshTokenRevoked(req);
    await AuthMiddleware.EmailVerified(req);
    await AuthMiddleware.AccountInactive(req);

    next();

  } catch (err) {
    next(err);
  }
}
