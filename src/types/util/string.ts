export interface StringUtility {
  toSlug(data: string): string;
  toSlugUnderscore(data: string): string;
  b64Url(data: string): string;
  b64Trim(data: string): string;
  numberCode(size: number): string;
  textBetween(src: string, begin: string, end: string): string;
  allTextBetween(src: string, begin: string, end: string): string[];
}
