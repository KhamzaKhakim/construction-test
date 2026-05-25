export const formatUnit = (str: string) =>
  str.replace(/\^(\d+)/g, (_, n: string) =>
    n
      .split("")
      .map((c: string) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)])
      .join(""),
  );
