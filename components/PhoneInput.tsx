import React from 'react';
import PhoneInputWithCountry from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = '+237 6XX XXX XXX',
  className = '',
}) => {
  return (
    <div className={`phone-input-wrapper ${className}`}>
      <PhoneInputWithCountry
        international
        defaultCountry="CM"
        value={value}
        onChange={(val) => onChange(val || '')}
        placeholder={placeholder}
        className="phone-input-field"
      />
      <style>{`
        .phone-input-wrapper {
          width: 100%;
        }
        .phone-input-wrapper .PhoneInput {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0 12px;
          transition: all 0.2s;
        }
        .phone-input-wrapper .PhoneInput:focus-within {
          border-color: rgb(59, 130, 246);
        }
        .phone-input-wrapper .PhoneInputCountry {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .phone-input-wrapper .PhoneInputCountryIcon {
          width: 24px;
          height: 18px;
          border-radius: 2px;
          overflow: hidden;
        }
        .phone-input-wrapper .PhoneInputCountryIcon--border {
          box-shadow: none;
          background: transparent;
        }
        .phone-input-wrapper .PhoneInputCountrySelectArrow {
          opacity: 0.5;
          margin-left: 4px;
        }
        .phone-input-wrapper .PhoneInputCountrySelect {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          z-index: 1;
          border: 0;
          opacity: 0;
          cursor: pointer;
        }
        .phone-input-wrapper .PhoneInputInput {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 14px;
          padding: 12px 0;
        }
        .phone-input-wrapper .PhoneInputInput::placeholder {
          color: rgb(148, 163, 184);
        }
      `}</style>
    </div>
  );
};

export default PhoneInput;
