export const handle = async ({ event, resolve }) => {
  const auth = event.cookies.get("auth");
  if (auth) {
    event.locals.auth = auth;
  }

  return await resolve(event);
};
