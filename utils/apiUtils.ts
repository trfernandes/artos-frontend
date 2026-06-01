export class ApiUtils {
  static nullToUndef = <T>(v: T | null | undefined): T | undefined =>
    v === null || v === undefined ? undefined : v;

  static undefToNull = <T>(v: T | null | undefined): T | null => (v === undefined ? null : v); // mantém null

  static isDefined = <T>(v: T | undefined): v is T => v !== undefined;
}
