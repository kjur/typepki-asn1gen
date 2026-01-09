import { describe, expect, test } from "bun:test";
import { pospad, getLength, getASN1, tagtohex } from "./index.mts";

test("pospad", () => {
  expect(pospad("1234")).toBe("1234");
  expect(pospad("001234")).toBe("1234");
  expect(pospad("00001234")).toBe("1234");
  expect(pospad("0000abcd")).toBe("00abcd");
  expect(pospad("abcd")).toBe("00abcd");
});

test("getLength", () => {
  expect(getLength(1)).toBe("01");
  expect(getLength(127)).toBe("7f");
  expect(getLength(128)).toBe("8180");
  expect(getLength(732)).toBe("8202dc");
});

test("getASN1", () => {
  let pASN1;
  expect(getASN1({t: "int", v: "12ab"})).toBe("020212ab");
  expect(getASN1({t: "int", v: {hex:"12ab"}})).toBe("020212ab");
  expect(getASN1({t: "seq", v: [
    {t: "int", v: "01"},
    {t: "int", v: "02"}
  ]})).toBe("3006020101020102");
  pASN1 = {
    t: "a4",
    v: [ { t: "octstr", v: { hex: "020101" }  } ]
  };
  expect(getASN1(pASN1)).toBe("a4050403020101");
  expect(getASN1({t:"octstr",v:{hex:"020101"}})).toBe("0403020101");
  pASN1 = {
    t: "seq", v: [
      { t: "seq", v: [
	{ t: "a4", v: [ { t: "octstr", v: { hex: "abcd" } } ] }
      ] },
      { t: "int", v: { hex: "1234" } }
    ]
  };
  expect(getASN1(pASN1)).toBe("300c3006a4040402abcd02021234");
  expect(getASN1({t:"octstr",v:{hex:"abcd"}})).toBe("0402abcd");
});

test("getASN1 - asn(1)", () => {
  
});

test("getASN1 - asn", () => {
  expect(getASN1({t: "asn", v: "", tlv: "020101" })).toBe("020101");
});

test("getASN1 - IssuerSerial cert /C=JP/O=T1", () => {
  const pASN1 = {
    t: "seq", v: [
      { t: "seq", v: [
	{ t: "a4", v: [ { t: "asn", v: "", tlv: "301a310b3009060355040613024a50310b3009060355040a0c025431" } ] }
      ] },
      { t: "int", v: { hex: "01" } }
    ]
  };
  expect(getASN1(pASN1)).toBe("3023301ea41c301a310b3009060355040613024a50310b3009060355040a0c025431020101");
});


test("tagtohex", () => {
  expect(tagtohex("81")).toBe("81");
  expect(tagtohex("octstr")).toBe("04");
  expect(tagtohex("seq")).toBe("30");
  expect(tagtohex("set")).toBe("31");
  expect(tagtohex("a0")).toBe("a0");
});
