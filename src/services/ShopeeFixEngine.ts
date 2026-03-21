export const SHOPEE_DIMS = {
  203: { pw: 812, ll: 1218 },
  300: { pw: 1200, ll: 1800 },
} as const;

export type DPI = 203 | 300;
export type SemaphoreStatus = "green" | "yellow" | "red";

export interface ShopeeAnalysis {
  status: SemaphoreStatus;
  foundPw: number | null;
  foundLl: number | null;
  expectedPw: number;
  expectedLl: number;
  hasXa: boolean;
  hasXz: boolean;
  messageKey: string;
  canFix: boolean;
}

const TOLERANCE = 0.05;

function withinTolerance(found: number, expected: number): boolean {
  return Math.abs(found - expected) / expected <= TOLERANCE;
}

export function analyzeShopeeZpl(zpl: string, dpi: DPI): ShopeeAnalysis {
  const expected = SHOPEE_DIMS[dpi];
  const hasXa = /\^XA/i.test(zpl);
  const hasXz = /\^XZ/i.test(zpl);

  if (!hasXa || !hasXz) {
    return {
      status: "red",
      foundPw: null,
      foundLl: null,
      expectedPw: expected.pw,
      expectedLl: expected.ll,
      hasXa,
      hasXz,
      messageKey: "result.invalidStructure",
      canFix: false,
    };
  }

  const pwMatch = zpl.match(/\^PW(\d+)/i);
  const llMatch = zpl.match(/\^LL(\d+)/i);
  const foundPw = pwMatch ? parseInt(pwMatch[1], 10) : null;
  const foundLl = llMatch ? parseInt(llMatch[1], 10) : null;

  if (foundPw === null || foundLl === null) {
    return {
      status: "yellow",
      foundPw,
      foundLl,
      expectedPw: expected.pw,
      expectedLl: expected.ll,
      hasXa,
      hasXz,
      messageKey: "result.missingDimensions",
      canFix: true,
    };
  }

  const pwOk = withinTolerance(foundPw, expected.pw);
  const llOk = withinTolerance(foundLl, expected.ll);

  if (pwOk && llOk) {
    return {
      status: "green",
      foundPw,
      foundLl,
      expectedPw: expected.pw,
      expectedLl: expected.ll,
      hasXa,
      hasXz,
      messageKey: "result.correct",
      canFix: false,
    };
  }

  return {
    status: "yellow",
    foundPw,
    foundLl,
    expectedPw: expected.pw,
    expectedLl: expected.ll,
    hasXa,
    hasXz,
    messageKey: "result.wrongDimensions",
    canFix: true,
  };
}

export function fixShopeeZpl(zpl: string, dpi: DPI): string {
  const { pw, ll } = SHOPEE_DIMS[dpi];

  let fixed = zpl.replace(/\^PW\d+/gi, "").replace(/\^LL\d+/gi, "");
  fixed = fixed.replace(/(\^XA)/i, `$1\n^PW${pw}\n^LL${ll}`);

  if (!/\^FO0,0/i.test(fixed)) {
    fixed = fixed.replace(
      /(\^XA[^\n]*\n(?:\^PW[^\n]*\n)?(?:\^LL[^\n]*\n)?)/i,
      "$1^FO0,0\n"
    );
  }

  fixed = fixed.replace(/\n{3,}/g, "\n\n");
  return fixed.trim();
}
