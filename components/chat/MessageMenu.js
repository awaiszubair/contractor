import { RiArrowDropDownLine } from "react-icons/ri";
import { useState, useEffect } from "react";

export default function MessageMenu({ onEdit, onDelete, editingId }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log("editingId changed:", editingId);
    if (editingId) setIsOpen(false);
  }, [editingId]);

  return (
    <div className="absolute top-1 right-2 z-20 transition">
      <div className="relative group">
        {/* <button className="text-gray-400 cursor-pointer hover:text-gray-200 text-xl leading-none focus:outline-none"> */}
        <RiArrowDropDownLine
          className="cursor-pointer"
          size={22}
          color="white"
          onClick={() => setIsOpen((prev) => !prev)}
        />
        {/* </button> */}
        <div
          className={`${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          } absolute right-0 mt-1 w-28 bg-white/95 backdrop-blur-sm
            border border-gray-200 rounded-lg shadow-xl
            transition-opacity duration-150
            pointer-events-none group-hover:pointer-events-auto
          `}
        >
          <button
            className="block w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-t-lg"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
