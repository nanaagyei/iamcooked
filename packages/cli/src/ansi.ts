const enabled =
  !process.env["NO_COLOR"] &&
  process.env["TERM"] !== "dumb" &&
  (process.env["FORCE_COLOR"] !== undefined || process.stdout.isTTY === true);

const wrap = (open: number, close: number) => (s: string) => (enabled ? `\x1b[${open}m${s}\x1b[${close}m` : s);

export const c = {
  bold: wrap(1, 22),
  dim: wrap(2, 22),
  italic: wrap(3, 23),
  underline: wrap(4, 24),
  red: wrap(31, 39),
  green: wrap(32, 39),
  yellow: wrap(33, 39),
  blue: wrap(34, 39),
  magenta: wrap(35, 39),
  cyan: wrap(36, 39),
  gray: wrap(90, 39),
  bgRed: wrap(41, 49),
  bgYellow: wrap(43, 49),
  bgGreen: wrap(42, 49),
  inverse: wrap(7, 27),
};

export const colorEnabled = enabled;
