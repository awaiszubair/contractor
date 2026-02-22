export default function MessageAttachments({ attachments }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <>
      {attachments.map((att, i) => {
        if (/\.(jpg|jpeg|png|gif)$/i.test(att)) {
          return (
            <img
              key={i}
              src={att}
              alt="attachment"
              className="mt-2 max-h-64 w-auto rounded-xl object-contain border border-black/10 shadow-sm"
            />
          );
        } else {
          return (
            <a
              key={i}
              href={att}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-blue-500 hover:text-blue-700 underline text-sm"
            >
              📎 {att.split("/").pop() || "Attachment"}
            </a>
          );
        }
      })}
    </>
  );
}
