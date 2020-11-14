export const removeSpaces = (param) => {
  let value = param;
  if (param !== undefined && param !== null) {
    value = param.trim();
  }
  return value;
};
export const removeNumberSpaces = (param) => {
  let value = param;
  if (param !== undefined && param !== null) {
    value = param.replace(",", "");
    value = param.replace(", ", "");
    value = param.replace("$", "");
    value = param.replace("$ ", "");
    value = param.replace(" %", "");
    value = param.replace("%", "");
    value = param.trim();
  }
  return value;
};
