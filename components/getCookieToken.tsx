export const HASURA_ADMIN_SECRET_KEY = "hasura:admin_secret";
export const getCookieToken = () => {
  return window.localStorage.getItem(HASURA_ADMIN_SECRET_KEY);
};
