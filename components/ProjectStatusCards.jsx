import React from "react";

function ProjectStatusCards({ title, status, icon }) {
  return (
    <div className="relative bg-white p-6 rounded-[20px] overflow-hidden shadow-[0px_0px_22.3px_0px_rgba(0,0,0,0.08)]">
      {/* Top Left */}
      <h3 className="text-gray-600 font-medium">{title}</h3>

      {/* Bottom Left */}
      <div className="mt-8">
        <p className="text-3xl font-bold">{status}</p>
        {/* <p className="text-sm text-green-600 mt-1">{title == "Open Projects"}</p> */}
      </div>

      {/* Grey Circle */}
      <div className="absolute right-[-20] bottom-[-20] w-[108px] h-[108px] rounded-full bg-[#E3E3E3]" />

      {/* Folder Icon - smaller */}
      <div className="absolute right-13 bottom-8 w-12 h-12">
        <div className="w-full h-full flex items-end justify-end">{icon}</div>
      </div>
    </div>
  );
}

export default ProjectStatusCards;
