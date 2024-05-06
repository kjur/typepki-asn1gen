import { describe, expect, test } from "bun:test";
import { pospad, getLength, getASN1 } from "./index.mts";

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
  expect(getASN1({t: "int", v: "12ab"})).toBe("020212ab");
  expect(getASN1({t: "seq", v: [
    {t: "int", v: "01"},
    {t: "int", v: "02"}
  ]})).toBe("3006020101020102");
});
