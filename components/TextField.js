import React from "react";

function TextField({
  label,
  name,
  value,
  placeholder,
  onChange,
  required = true,
  type = "text",
  classes,
}) {
  return (
    <div className={`${classes}`}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {type === "textarea" ? (
        <textarea
          name={name}
          required
          value={value}
          onChange={onChange}
          className="w-full border-1 border-[#00000033] h-24
p-2 rounded-[15px] bg-[#F8F8F8] 
focus:outline-none 
focus:border-[#00000066] 
focus:ring-2 focus:ring-[#00000022]"
        />
      ) : (
        <input
          name={name}
          required={required}
          type={type}
          value={value}
          onChange={onChange}
          className="w-full border-1 border-[#00000033] 
p-2 rounded-[15px] bg-[#F8F8F8] 
focus:outline-none 
focus:border-[#00000066] 
focus:ring-2 focus:ring-[#00000022]"
          placeholder={placeholder || `Enter ${label}`}
        />
      )}
    </div>
  );
}

export default TextField;
