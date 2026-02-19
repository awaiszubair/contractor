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
          <Link
            key={message._id}
            href={`/messages?chatId=${message.project._id}&userId=${otherUser._id}&messageId=${message._id}`}
            className="block bg-white p-4 rounded-[20px] shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex gap-x-2 justify-between items-start">
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
              
              <div className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleDateString()}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}