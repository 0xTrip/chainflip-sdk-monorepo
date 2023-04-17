export default class ServiceError extends Error {
  static badRequest(message: string): ServiceError {
    return new ServiceError(message, 400);
  }

  static notFound(message = 'resource not found'): ServiceError {
    return new ServiceError(message, 404);
  }

  constructor(message: string, readonly code: number) {
    super(message);

    Error.captureStackTrace(this, ServiceError);
  }
}
