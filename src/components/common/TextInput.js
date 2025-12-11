// admin/src/components/common/TextInput.js
import React from "react";

function TextInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={
          "w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 " +
          className
        }
        {...props}
      />
    </div>
  );
}

export default TextInput;
