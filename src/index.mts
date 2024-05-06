import { ishex } from "typepki-strconv";

/**
 * ASN.1 data object definition
 * @example
 * let d: ASN1Data = { t: "int", v: "1234" };
 */
export interface ASN1Data {
  t: string;
  v: any;
}

/**
 * generate ASN.1 DER/BER encoded hexadecimal string from JSON data
 * @param p - JSON object representing ASN.1 structure
 * @return hexadecimal string of ASN.1 DER/BER encoded hexadecimal string
 * @example
 * getASN1({ t: "int", v: "12ab" }) -> "020212ab"
 * getASN1({ t: "seq", v: [
 *   { t: "int", v: "01" },
 *   { t: "int", v: "02" }
 * ]}) -> "3006020101020102"
 */
export function getASN1(p: ASN1Data): string {
  switch (p.t) {
    case "int":
      return generateASN1_int(p.v);
    case "seq":
      return generateASN1_seq(p.v);
  }
  return "";
}

function generateASN1_int(v: string | object): string {
  if (typeof v == "string" && ishex(v)) {
    return `02${getLength(v.length / 2)}${v}`;
  }
  return "";
}

function generateASN1_seq(v: Array<ASN1Data>): string {
  let hV = "";
  for (let i = 0; i < v.length; i++) {
    hV += getASN1(v[i]);
  }
  return `30${getLength(hV.length / 2)}${hV}`;
}

/**
 * convert hexadecimal positive integer to ASN.1 integer value
 * @param h - hexadecimal string of positive integer
 * @return ASN.1 Integer DER encoded hexadecimal string
 * @example
 * pospad("01") -> "01"
 * pospad("ab") -> "00ab"
 * pospad("00000012") -> "12"
 * pospad("000000ab") -> "00ab"
 */
export function pospad(h: string): string {
  h = h.replace(/^(00){1,}/, '');
  if (h.match(/^[8-9a-f]/)) return "00" + h;
  return h;  
}

/**
 * get ASN.1 TLV length octet(s) by TLV value octet length
 * @param n - TLV value octet length
 * @return hexadecimal string of TLV length octets
 * @example
 * getLength(3) -> "03"
 * getLength(128) -> "8180"
 */
export function getLength(n: number): string {
  let hL;
  if (n < 128) {
    hL = hexpad(n.toString(16));
    return hL;
  }
  hL = hexpad(n.toString(16));
  const iTop = 128 + (hL.length / 2);
  const hTop = iTop.toString(16);
  return hTop + hL;
}

/**
 * zero padding for hexadecimal string
 * @param s - odd or even length hexadecimal string
 * @return even length zero padded hexadecimal string
 * @example
 * hexpad("1") -> "01"
 * hexpad("ab3c") -> "ab3c"
 */
export function hexpad(s: string): string {
  return (s.length % 2 === 1) ? `0${s}` : s;
}
