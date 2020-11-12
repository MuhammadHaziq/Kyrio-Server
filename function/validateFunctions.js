export const removeSpaces = (param) => {
  let value = param;
  if (param !== undefined && param !== null) {
    value = param.trim();
  }
  return value;
};
