import React, { useState, useEffect, useRef } from "react";

/**
 * INRCurrencyInput
 * A React + Tailwind single-file component that formats numbers as Indian Rupee currency (₹) using
 * the Indian grouping (1,23,45,678.90) and supports live editing.
 *
 * Features:
 * - Formats using Intl.NumberFormat('en-IN') for correct grouping (lakhs & crores).
 * - Preserves user decimal typing while typing (up to 2 decimals by default).
 * - Calls onChange with a numeric value (number) or null when input is empty/invalid.
 * - Accepts controlled `value` (number) or you can omit for an uncontrolled experience.
 * - Tailwind-friendly classes; easily themeable.
 *
 * Usage:
 * <INRCurrencyInput value={amount} onChange={v => setAmount(v)} placeholder="Enter amount" />
 */

const inrFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

function formatINRFromString(raw, { prefix = "", maxDecimals = 2 } = {}) {
  // raw: string that may contain digits, dots, commas, minus, currency symbol
  if (raw == null) return "";
  const cleaned = String(raw).replace(/[^0-9.-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return prefix + cleaned;

  // handle multiple dots or minus signs gracefully: keep first dot and first minus
  let negative = false;
  let s = cleaned;
  if (s[0] === "-") {
    negative = true;
    s = s.slice(1);
  }
  const parts = s.split(".");
  const intPart = parts[0] || "0";
  const decPart = (parts[1] || "").slice(0, maxDecimals);

  // format integer part using Intl for en-IN grouping
  const intNum = parseInt(intPart, 10);
  const formattedInt = isNaN(intNum) ? "0" : inrFormatter.format(intNum);

  const formatted = decPart.length > 0 ? `${formattedInt}.${decPart}` : formattedInt;
  return `${negative ? "-" : ""}${prefix}${formatted}`;
}

function parseToNumber(displayValue) {
  if (!displayValue) return null;
  const cleaned = String(displayValue).replace(/[₹,\s]/g, "").trim();
  // allow a leading -
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export default function INRCurrencyInput({
  name=null,
  value = null, // numeric value (e.g. 12345.5) when controlled
  onChange = () => {}, // receives numeric value or null
  placeholder = "0",
  className = "w-full p-2 border rounded-md",
  maxDecimals = 2,
  prefix = "",
  disabled = false,
}) {
  const [display, setDisplay] = useState("");
  const isControlled = value !== null && value !== undefined;
  const inputRef = useRef(null);

  // derive display when controlled value changes
  useEffect(() => {
    if (isControlled) {
      if (value === null || value === undefined || Number.isNaN(value)) {
        setDisplay("");
      } else {
        const parts = String(Math.abs(value)).split(".");
        const intPart = parts[0] || "0";
        const decPart = (parts[1] || "").slice(0, maxDecimals);
        const formattedInt = inrFormatter.format(parseInt(intPart, 10));
        const formatted = decPart.length > 0 ? `${formattedInt}.${decPart}` : formattedInt;
        setDisplay(`${value < 0 ? "-" : ""}${prefix}${formatted}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isControlled]);

  // handle typing
  function handleChange(e) {
    const raw = e.target.value;

    // we allow user to type digits, ., -, ₹, commas and spaces — we'll clean
    const cleanedForCalc = raw.replace(/[^0-9.-]/g, "");

    // If user only typed '-', keep it visible
    if (cleanedForCalc === "-" || cleanedForCalc === "" || cleanedForCalc === ".") {
      setDisplay(raw);
      onChange({target:{type:'number',value:"",name:e.target.name}});
      return;
    }

    // Build formatted display preserving trailing dot/decimal digits user may be typing
    const formatted = formatINRFromString(raw, { prefix, maxDecimals });
    setDisplay(formatted);

    // parse numeric value to send via onChange
    const numeric = parseToNumber(formatted);
    // e.target.type = "number";
    // e.target.value = numeric.toString();
    onChange({target:{type:'number',value:numeric?.toString()||"",name:e.target.name}});
  }

  // on blur ensure display is nicely formatted (two decimals if decimals present)
  function handleBlur() {
    const numeric = parseToNumber(display);
    if (numeric === null) {
      setDisplay("");
      onChange({target:{type:'number',value:"",name:name}});
      return;
    }

    // Format with up to maxDecimals (show decimals if they exist)
    const showDecimals = maxDecimals > 0;
    const opts = { minimumFractionDigits: 0, maximumFractionDigits: maxDecimals };
    const nf = new Intl.NumberFormat("en-IN", opts);

    const abs = Math.abs(numeric);
    const formatted = `${numeric < 0 ? "-" : ""}${prefix}${nf.format(abs)}`;
    setDisplay(formatted);
  }

  function handleFocus() {
    // When focusing, convert display to a raw editable string without ₹ and commas for easier editing
    const cleaned = display.replace(/[₹,\s]/g, "");
    setDisplay(cleaned);
    // move caret to end
    setTimeout(() => {
      const inp = inputRef.current;
      if (inp && inp.setSelectionRange) {
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
    }, 0);
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        name={name}
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={`appearance-none ${className} text-sm leading-6`}
      />
    </div>
  );
}

/**
 * Example usage (inside a parent component):
 *
 * const [amount, setAmount] = useState(123456.78);
 * <INRCurrencyInput value={amount} onChange={v => setAmount(v)} />
 *
 * Or for uncontrolled usage:
 * <INRCurrencyInput onChange={v => console.log(v)} />
 */