// components/INRCurrencyInput.jsx - Hybrid Version
import React from 'react';
import CurrencyInput from 'react-currency-input-field';

const INRCurrencyInput = ({ value, onChange, disabled, placeholder, ...props }) => {
  const stringValue = value?.toString() || '';
  const cleanValue = stringValue.replace(/[^\d.]/g, '') || '';

  return (
    <CurrencyInput
      value={cleanValue}
      onValueChange={(value, name) => {
        onChange({
          target: {
            name: props.name || name,
            value: value || '0'
          }
        });
      }}
      // Try intlConfig first, fallback to manual if needed
      intlConfig={{ locale: 'en-IN', currency: 'INR' }}
      // Fallback manual configuration
      decimalSeparator="."
      groupSeparator=","
      prefix="₹ "
      decimalsLimit={2}
      decimalScale={2}
      allowNegativeValue={false}
      disableAbbreviations={true}
      allowDecimals={true}
      className={`
        w-full px-3 py-2 border border-gray-300 rounded-md 
        focus:outline-none focus:ring-2 focus:ring-purple-500
        ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
      `}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

export default INRCurrencyInput;