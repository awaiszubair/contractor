const TickSvg = ({ color }) => (
  <svg className={`w-4 h-4 ${color}`} viewBox="0 0 16 16" fill="currentColor">
    <path d="M10.97 5.47a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
  </svg>
);

export default function MessageTicks({ status }) {
  if (status === "read") {
    return (
      <span className="inline-flex ml-1">
        <TickSvg color="text-blue-500" />
        <TickSvg color="text-blue-500 -ml-2" />
      </span>
    );
  }
  if (status === "delivered") {
    return (
      <span className="inline-flex ml-1">
        <TickSvg color="text-gray-400" />
        <TickSvg color="text-gray-400 -ml-2" />
      </span>
    );
  }
  // sent (single tick)
  return (
    <span className="inline-flex ml-1">
      <TickSvg color="text-gray-400" />
    </span>
  );
}
