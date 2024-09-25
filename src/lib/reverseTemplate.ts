export const reverseTemplate = (template: string, str: string) => {
  const parts = template.split("{{INPUT}}");
  const start = parts[0].length;
  const end = -parts[1].length;
  return str.slice(start, end);
};
