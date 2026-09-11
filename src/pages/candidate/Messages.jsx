import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  CheckCheck,
  MessageCircle,
  BriefcaseBusiness,
  Inbox,
  Loader2,
  Trash2,
  RefreshCw,
} from "lucide-react";

import { useSelector } from "react-redux";
import { apiRequest } from "../../services/api";

// ==========================================
// HELPERS
// ==========================================

const getStoredUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const getInitials = (name = "") => {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "U";

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const formatTime = (date) => {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  return value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatConversationTime = (date) => {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  const now = new Date();

  if (value.toDateString() === now.toDateString()) {
    return formatTime(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (
    value.toDateString() ===
    yesterday.toDateString()
  ) {
    return "Yesterday";
  }

  return value.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
};

// ==========================================
// PROFILE AVATAR
// ==========================================

const Avatar = ({
  user,
  size = "md",
  online = false,
}) => {
  const sizeClasses = {
    sm: "h-9 w-9 text-[10px]",
    md: "h-11 w-11 text-xs",
    lg: "h-12 w-12 text-xs",
  };

  return (
    <div className="relative shrink-0">
      {user?.profileImage ? (
        <img
          src={user.profileImage}
          alt={user.name || "User"}
          className={`${sizeClasses[size]} rounded-2xl object-cover`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} flex items-center justify-center rounded-2xl bg-slate-900 font-bold text-white`}
        >
          {getInitials(user?.name)}
        </div>
      )}

      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      )}
    </div>
  );
};

// ==========================================
// COMPONENT
// ==========================================

function Messages() {
  const reduxUser = useSelector(
    (state) => state.auth?.user
  );

  const reduxToken = useSelector(
    (state) => state.auth?.token
  );

  const currentUser =
    reduxUser || getStoredUser();

  const token =
    reduxToken ||
    localStorage.getItem("token");

  const currentUserId =
    currentUser?.id ||
    currentUser?._id ||
    "";

  const [conversations, setConversations] =
    useState([]);

  const [activeUserId, setActiveUserId] =
    useState(null);

  const [activeUser, setActiveUser] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loadingInbox, setLoadingInbox] =
    useState(true);

  const [
    loadingConversation,
    setLoadingConversation,
  ] = useState(false);

  const [sending, setSending] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  // ==========================================
  // FETCH INBOX
  // ==========================================

  const fetchInbox = useCallback(
    async (silent = false) => {
      if (!token) {
        if (!silent) {
          setLoadingInbox(false);
          setError("Please login first.");
        }

        return [];
      }

      try {
        if (!silent) {
          setLoadingInbox(true);
        }

        const response =
          await apiRequest(
            "/messages",
            "GET",
            null,
            token
          );

        const data = Array.isArray(
          response?.data
        )
          ? response.data
          : [];

        setConversations(data);

        setActiveUser((previous) => {
          if (!activeUserId) {
            return previous;
          }

          const activeConversation =
            data.find(
              (item) =>
                String(item?.user?.id) ===
                  String(activeUserId) ||
                String(item?.user?._id) ===
                  String(activeUserId)
            );

          return (
            activeConversation?.user ||
            previous
          );
        });

        return data;
      } catch (err) {
        console.error(
          "Failed to fetch inbox:",
          err
        );

        if (!silent) {
          setError(
            err.message ||
              "Unable to load messages."
          );
        }

        return [];
      } finally {
        if (!silent) {
          setLoadingInbox(false);
        }
      }
    },
    [token, activeUserId]
  );

  // ==========================================
  // FETCH CONVERSATION
  // ==========================================

  const fetchConversation = useCallback(
    async (
      userId,
      silent = false,
      markRead = false
    ) => {
      if (!userId || !token) return;

      try {
        if (!silent) {
          setLoadingConversation(true);
        }

        const response =
          await apiRequest(
            `/messages/conversation/${userId}`,
            "GET",
            null,
            token
          );

        const data = Array.isArray(
          response?.data
        )
          ? response.data
          : [];

        setMessages(data);

        if (response?.conversationWith) {
          setActiveUser(
            response.conversationWith
          );
        }

        if (markRead) {
          await apiRequest(
            `/messages/read/${userId}`,
            "PATCH",
            null,
            token
          );

          await fetchInbox(true);
        }
      } catch (err) {
        console.error(
          "Failed to fetch conversation:",
          err
        );

        if (!silent) {
          setError(
            err.message ||
              "Unable to load conversation."
          );
        }
      } finally {
        if (!silent) {
          setLoadingConversation(false);
        }
      }
    },
    [token, fetchInbox]
  );

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  // ==========================================
  // LOAD ACTIVE CONVERSATION
  // ==========================================

  useEffect(() => {
    if (!activeUserId) {
      setMessages([]);
      return;
    }

    fetchConversation(
      activeUserId,
      false,
      true
    );
  }, [activeUserId, fetchConversation]);

  // ==========================================
  // AUTO REFRESH
  // ==========================================

  useEffect(() => {
    if (!activeUserId) return;

    const interval = setInterval(() => {
      fetchInbox(true);

      fetchConversation(
        activeUserId,
        true,
        false
      );
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [
    activeUserId,
    fetchInbox,
    fetchConversation,
  ]);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredConversations =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return conversations;
      }

      return conversations.filter(
        (conversation) => {
          const user =
            conversation?.user;

          const name = String(
            user?.name || ""
          ).toLowerCase();

          const company = String(
            user?.company || ""
          ).toLowerCase();

          const lastMessage =
            String(
              conversation?.lastMessage
                ?.text || ""
            ).toLowerCase();

          return (
            name.includes(query) ||
            company.includes(query) ||
            lastMessage.includes(query)
          );
        }
      );
    }, [conversations, search]);

  // ==========================================
  // TOTAL UNREAD
  // ==========================================

  const totalUnread = useMemo(() => {
    return conversations.reduce(
      (total, conversation) =>
        total +
        Number(
          conversation?.unreadCount || 0
        ),
      0
    );
  }, [conversations]);

  // ==========================================
  // OPEN CONVERSATION
  // ==========================================

  const openConversation = (user) => {
    const userId =
      user?.id ||
      user?._id;

    if (!userId) return;

    setActiveUserId(
      String(userId)
    );

    setActiveUser(user);
    setMessages([]);
    setError("");
  };

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = async () => {
    const cleanMessage =
      message.trim();

    if (
      !cleanMessage ||
      !activeUserId ||
      sending ||
      !token
    ) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const response =
        await apiRequest(
          "/messages",
          "POST",
          {
            receiverId:
              activeUserId,
            text: cleanMessage,
          },
          token
        );

      const sentMessage =
        response?.data;

      if (sentMessage) {
        setMessages((current) => [
          ...current,
          sentMessage,
        ]);
      }

      setMessage("");

      await fetchInbox(true);
    } catch (err) {
      console.error(
        "Failed to send message:",
        err
      );

      setError(
        err.message ||
          "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // DELETE MESSAGE
  // ==========================================

  const deleteMessage = async (
    messageId
  ) => {
    if (!messageId || !token) return;

    try {
      setDeletingId(messageId);
      setError("");

      await apiRequest(
        `/messages/${messageId}`,
        "DELETE",
        null,
        token
      );

      setMessages((current) =>
        current.filter(
          (item) =>
            String(
              item?.id ||
                item?._id
            ) !==
            String(messageId)
        )
      );

      await fetchInbox(true);
    } catch (err) {
      console.error(
        "Failed to delete message:",
        err
      );

      setError(
        err.message ||
          "Unable to delete message."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // ENTER TO SEND
  // ==========================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  // ==========================================
  // NO TOKEN
  // ==========================================

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <MessageCircle className="mx-auto h-10 w-10 text-indigo-600" />

          <h1 className="mt-4 text-xl font-bold">
            Please login first
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Your session is required to view
            messages.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Candidate Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Messages
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                fetchInbox()
              }
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <div className="hidden items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 sm:flex">
              <MessageCircle className="h-4 w-4" />
              {totalUnread} unread
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[330px_1fr]">
          {/* LEFT SIDEBAR */}

          <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-200 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold">
                    Conversations
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Recruiters & support
                  </p>
                </div>

                <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                  <Inbox className="h-4 w-4" />
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search messages..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="max-h-[650px] overflow-y-auto">
              {loadingInbox ? (
                <div className="flex items-center justify-center p-10">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                </div>
              ) : filteredConversations.length ===
                0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="mx-auto h-9 w-9 text-slate-300" />

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    No conversations yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Your recruiter messages will
                    appear here.
                  </p>
                </div>
              ) : (
                filteredConversations.map(
                  (conversation) => {
                    const user =
                      conversation?.user;

                    const userId =
                      String(
                        user?.id ||
                          user?._id ||
                          ""
                      );

                    if (!userId) {
                      return null;
                    }

                    const active =
                      userId ===
                      String(
                        activeUserId
                      );

                    return (
                      <button
                        key={userId}
                        type="button"
                        onClick={() =>
                          openConversation(
                            user
                          )
                        }
                        className={`w-full border-b border-slate-100 p-4 text-left transition ${
                          active
                            ? "bg-indigo-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex gap-3">
                          <Avatar
                            user={user}
                            online={false}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold">
                                  {user?.name ||
                                    "Unknown User"}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                  {user?.company ||
                                    user?.role ||
                                    "User"}
                                </p>
                              </div>

                              <span className="shrink-0 text-[10px] text-slate-400">
                                {formatConversationTime(
                                  conversation
                                    ?.lastMessage
                                    ?.createdAt
                                )}
                              </span>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                              <p className="truncate text-xs text-slate-500">
                                {conversation
                                  ?.lastMessage
                                  ?.text ||
                                  "No message"}
                              </p>

                              {Number(
                                conversation?.unreadCount ||
                                  0
                              ) > 0 && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                                  {
                                    conversation.unreadCount
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  }
                )
              )}
            </div>
          </aside>

          {/* RIGHT CHAT */}

          <section className="flex min-h-[700px] flex-col bg-slate-50">
            {!activeUser ? (
              <div className="flex flex-1 items-center justify-center p-8">
                <div className="max-w-sm text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
                    <MessageCircle className="h-7 w-7" />
                  </div>

                  <h2 className="mt-5 text-lg font-bold">
                    Your messages
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Select a conversation to start
                    chatting with a recruiter.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* CHAT HEADER */}

                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      user={activeUser}
                      size="lg"
                    />

                    <div>
                      <h2 className="font-bold">
                        {activeUser.name ||
                          "User"}
                      </h2>

                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <BriefcaseBusiness className="h-3.5 w-3.5" />

                        <span>
                          {activeUser.company ||
                            activeUser.role ||
                            "Recruiter"}
                        </span>

                        {activeUser.role && (
                          <>
                            <span>•</span>

                            <span>
                              {activeUser.role}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-100"
                      title="Call"
                    >
                      <Phone className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-100"
                      title="Video"
                    >
                      <Video className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-100"
                      title="More"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* ERROR */}

                {error && (
                  <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-xs font-medium text-red-600">
                    {error}
                  </div>
                )}

                {/* CHAT */}

                <div className="flex-1 overflow-y-auto px-5 py-6">
                  <div className="mb-6 flex justify-center">
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 shadow-sm">
                      Conversation
                    </span>
                  </div>

                  {loadingConversation ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
                    </div>
                  ) : messages.length ===
                    0 ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <MessageCircle className="mx-auto h-9 w-9 text-slate-300" />

                        <p className="mt-3 text-sm font-semibold text-slate-500">
                          No messages yet
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Send the first message.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {messages.map(
                        (item) => {
                          const senderId =
                            item?.sender?.id ||
                            item?.sender?._id ||
                            item?.senderId ||
                            "";

                          const mine =
                            Boolean(
                              currentUserId &&
                                String(
                                  senderId
                                ) ===
                                  String(
                                    currentUserId
                                  )
                            );

                          const messageId =
                            item?.id ||
                            item?._id;

                          if (!messageId) {
                            return null;
                          }

                          return (
                            <div
                              key={
                                messageId
                              }
                              className={`flex ${
                                mine
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div className="group max-w-[80%]">
                                <div
                                  className={`relative rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                                    mine
                                      ? "rounded-br-md bg-indigo-600 text-white"
                                      : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                                  }`}
                                >
                                  {item.text}

                                  {mine && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteMessage(
                                          messageId
                                        )
                                      }
                                      disabled={
                                        deletingId ===
                                        messageId
                                      }
                                      className="absolute -right-9 top-1/2 hidden -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-red-500 group-hover:block"
                                      title="Delete"
                                    >
                                      {deletingId ===
                                      messageId ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                  )}
                                </div>

                                <div
                                  className={`mt-1 flex items-center gap-1 text-[10px] text-slate-400 ${
                                    mine
                                      ? "justify-end"
                                      : ""
                                  }`}
                                >
                                  <span>
                                    {formatTime(
                                      item.createdAt
                                    )}
                                  </span>

                                  {mine && (
                                    <CheckCheck
                                      className={`h-3.5 w-3.5 ${
                                        item.read
                                          ? "text-indigo-500"
                                          : "text-slate-400"
                                      }`}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>

                {/* INPUT */}

                <div className="border-t border-slate-200 bg-white p-4">
                  <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
                    <button
                      type="button"
                      className="rounded-xl p-2.5 text-slate-400 hover:text-slate-700"
                      title="Attach"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>

                    <textarea
                      rows={1}
                      value={message}
                      onChange={(event) =>
                        setMessage(
                          event.target.value
                        )
                      }
                      onKeyDown={
                        handleKeyDown
                      }
                      maxLength={5000}
                      placeholder="Write a message..."
                      className="min-h-[42px] flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm outline-none"
                    />

                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={
                        !message.trim() ||
                        sending
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-[11px] text-slate-400">
                    Press Enter to send • Shift +
                    Enter for new line
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Messages;