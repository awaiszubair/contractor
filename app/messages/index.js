import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import DashboardNav from "@/components/DashboardNav";
import ChatSidebar from "@/components/chat/ChatSidebar";

import { useChatSocket } from "@/hooks/useChatSocket";
import { useTyping } from "@/hooks/useTyping";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/Messagelist";
import ChatInput from "@/components/chat/ChatInput";
import ChatEmptyState from "@/components/chat/ChatEmptyState";
import VoiceRecorder from "@/components/chat/VoiceRecorder";

export {
  useEffect,
  useState,
  useRef,
  useAuth,
  useSocket,
  DashboardNav,
  ChatSidebar,
  useChatSocket,
  useTyping,
  useVoiceRecording,
  ChatHeader,
  MessageList,
  ChatInput,
  ChatEmptyState,
  VoiceRecorder,
};
