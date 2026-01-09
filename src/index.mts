export const VERSION: string = "typepki-asn1gen 0.5.0 kjur.github.io/typepki-asn1ge";
import { ishex } from "typepki-strconv";
import { ASN1Object, ASN1Value } from "typepki-asn1parse";

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
export function getASN1(p: ASN1Object): string {
  if (p.t == "asn" && p.tlv !== undefined) return p.tlv;

  if (p.t == "seq" || p.t == "set" || p.t.match(/^a\d$/)) {
    let hV = "";
    let aASN: ASN1Object[] = p.v as ASN1Object[];
    for (let i = 0; i < aASN.length; i++) {
      hV += getASN1(aASN[i]);
    }
    const hL = getLength(hV.length / 2);
    const hT = tagtohex(p.t);
    return `${hT}${hL}${hV}`;
  }

  const hT: string = tagtohex(p.t);
  const hV: string = _getValueHex(p.v);
  const hL: string = getLength(hV.length / 2);
  return `${hT}${hL}${hV}`;

  return "";
}

function _getValueHex(value: ASN1Value): string {
  if (typeof value === "string") {
    if (value.match(/^[0-9a-f]+$/)) return value;
    throw new Error("string but not hex");
  } else if (typeof value === "object") {
    if ("hex" in value && typeof value.hex == "string") return value.hex;
    throw new Error(`unsupported value object: ${JSON.stringify(value)}`);
  }
  throw new Error("unsupported value");
}

/**
 * get a hexadecimal string of ASN.1 tag by a tag name
 * @param tagName - name of ASN.1 tag
 * @return hexadecimal string of ASN.1 tag
 * @example
 * tagtohex("bool") -> "01"
 * tagtohex("utf8str") -> "0c"
 * tagtohex("a4") -> context specific constructed tag 4
 * tagtohex("80") -> context specific tag 0
 */
export function tagtohex(tagName: string): string {
  switch (tagName) {
    case "bool":	return "01";
    case "int":		return "02";
    case "bitstr":	return "03";
    case "octstr":	return "04";
    case "null":	return "05";
    case "oid":		return "06";
    case "enum":	return "0a";
    case "utf8str":	return "0c";
    case "numstr":	return "12";
    case "prnstr":	return "13";
    case "telstr":	return "14";
    case "vidstr":	return "15";
    case "ia5str":	return "16";
    case "utctime":	return "17";
    case "gentime":	return "18";
    case "grastr":	return "19";
    case "visstr":	return "1a";
    case "genstr":	return "1b";
    case "unistr":	return "1c";
    case "chrstr":	return "1d";
    case "bmpstr":	return "1e";
    case "seq":		return "30";
    case "set":		return "31";
  }
  if (tagName.match(/^[8a]\d$/)) return tagName;
  throw new Error(`unsupported tagName: ${tagName}`);
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
 * @deprecated use hexpad in typepki-strconv
 * @example
 * hexpad("1") -> "01"
 * hexpad("ab3c") -> "ab3c"
 */
export function hexpad(s: string): string {
  return (s.length % 2 === 1) ? `0${s}` : s;
}
