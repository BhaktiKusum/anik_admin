// admin/src/components/common/Button.js
import React from "react";

function Button({ children, className = "", loading, disabled, ...props }) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={
        "inline-flex items-center justify-center rounded-md border border-transparent bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 " +
        className
      }
    >
      {loading && (
        <span className="mr-2 h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export default Button;
