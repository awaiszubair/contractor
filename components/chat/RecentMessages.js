import Link from "next/link";
import { useState, useEffect } from "react";

export default function RecentMessages({ currentUserId }) {
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    fetchRecentMessages();
  }, []);

  const fetchRecentMessages = async () => {
    try {
      const res = await fetch("/api/messages/recent");
      const data = await res.json();
      setRecentMessages(data);
    } catch (error) {
      console.error("Error fetching recent messages:", error);
    }
  };

  return (
    <div className="space-y-3">
      {recentMessages.map((message) => {
        const isMe = message.sender._id === currentUserId;
        const otherUser = isMe ? message.receiver : message.sender;
        
        return (
          // <Link
          //   key={message._id}
          //   href={`/messages?chatId=${message.project._id}&userId=${otherUser._id}&messageId=${message._id}`}
          //   className="block bg-white p-4 rounded-[20px] shadow-sm hover:shadow-md transition-shadow"
          // >
          //   <div className="flex gap-x-2 justify-between items-start">
          //     <div className="flex-1">
          //       <div className="flex items-center gap-2">
          //         <span className="font-bold">{otherUser.name}</span>
          //         <span className="text-xs text-gray-400">•</span>
          //         <span className="text-sm text-gray-600">
          //           {message.project.title}
          //         </span>
          //       </div>
          //       <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          //         {message.type === "voice" 
          //           ? "🎤 Voice message" 
          //           : isMe 
          //             ? `You: ${message.content}` 
          //             : message.content}
          //       </p>
          //     </div>
              
          //     <div className="text-xs text-gray-500">
          //       {new Date(message.createdAt).toLocaleDateString()}
          //     </div>
          //   </div>
          // </Link>
          <Link
  key={message._id}
  href={`/messages?chatId=${message.project._id}&userId=${otherUser._id}&messageId=${message._id}`}
  className="block bg-white p-4 rounded-[20px] shadow-sm hover:shadow-md transition-shadow"
>

  {/* ================= Desktop & Tablet (UNCHANGED) ================= */}
  <div className="hidden sm:flex gap-x-2 justify-between items-start">
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="font-bold">{otherUser.name}</span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-sm text-gray-600">
          {message.project.title}
        </span>
      </div>

      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
        {message.type === "voice" 
          ? "🎤 Voice message" 
          : isMe 
            ? `You: ${message.content}` 
            : message.content}
      </p>
    </div>

    <div className="text-xs text-gray-500 whitespace-nowrap">
      {new Date(message.createdAt).toLocaleDateString()}
    </div>
  </div>

  {/* ================= Mobile Layout ================= */}
  <div className="sm:hidden space-y-2">
    
    {/* Top Row: Name + Date */}
    <div className="flex justify-between items-start">
      <span className="font-bold text-sm">
        {otherUser.name}
      </span>

      <span className="text-xs text-gray-500 whitespace-nowrap">
        {new Date(message.createdAt).toLocaleDateString()}
      </span>
    </div>

    {/* Project Title */}
    <div className="text-xs text-gray-500">
      {message.project.title}
    </div>

    {/* Message Preview */}
    <p className="text-sm text-gray-600 line-clamp-2">
      {message.type === "voice" 
        ? "🎤 Voice message" 
        : isMe 
          ? `You: ${message.content}` 
          : message.content}
    </p>

  </div>

</Link>

        );
      })}
    </div>
  );
}