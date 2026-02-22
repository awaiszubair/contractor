// import React from "react";

// function TextField({
//   label,
//   name,
//   value,
//   placeholder,
//   onChange,
//   required = true,
//   type = "text",
//   classes,
// }) {
//   return (
//     <div className={`${classes}`}>
//       <label className="block text-sm font-medium mb-1">{label}</label>
//       {type === "textarea" ? (
//         <textarea
//           name={name}
//           required
//           value={value}
//           onChange={onChange}
//           className="w-full border-1 border-[#00000033] h-24
// p-2 rounded-[15px] bg-[#F8F8F8] 
// focus:outline-none 
// focus:border-[#00000066] 
// focus:ring-2 focus:ring-[#00000022]"
//         />
//       ) : (
//         <input
//           name={name}
//           required={required}
//           type={type}
//           value={value}
//           onChange={onChange}
//           className="w-full border-1 border-[#00000033] 
// p-2 rounded-[15px] bg-[#F8F8F8] 
// focus:outline-none 
// focus:border-[#00000066] 
// focus:ring-2 focus:ring-[#00000022]"
//           placeholder={placeholder || `Enter ${label}`}
//         />
//       )}
//     </div>
//   );
// }

// export default TextField;


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
  // Date input ke liye ref
  const dateInputRef = React.useRef(null);

   const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  // Date field pe click handler
  const handleDateClick = () => {
    if (type === "date" && dateInputRef.current) {
      dateInputRef.current.showPicker(); // Calendar khol do
    }
  };

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
          ref={type === "date" ? dateInputRef : null}
          name={name}
          required={required}
          type={type}
          value={value}
          onChange={onChange}
          onClick={handleDateClick} // Yeh add karo
          min={type === "date" ? getTodayDate() : undefined}
          className="w-full border-1 border-[#00000033] 
p-2 rounded-[15px] bg-[#F8F8F8] 
focus:outline-none 
focus:border-[#00000066] 
focus:ring-2 focus:ring-[#00000022]
" // cursor bhi pointer kar do
          placeholder={placeholder || `Enter ${label}`}
        />
      )}
    </div>
  );
}

export default TextField;