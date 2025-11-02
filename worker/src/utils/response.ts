// Utility functions for consistent API responses

export const success = <T>(data: T, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const error = (message: string, status = 500) => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const unauthorized = (message = 'Unauthorized') => {
  return error(message, 401);
};

export const notFound = (message = 'Not Found') => {
  return error(message, 404);
};

export const badRequest = (message = 'Bad Request') => {
  return error(message, 400);
};
