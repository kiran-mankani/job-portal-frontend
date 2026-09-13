import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  Send,
  Trash2,
  MessageCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { useSelector } from "react-redux";
import { apiRequest } from "../../services/api";

// =========================================================
// HELPERS
// =========================================================

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  null;

const getId = (obj) => {
  if (!obj) {
    return "";
  }

  if (typeof obj === "string") {
    return obj;
  }

  return String(
    obj.id ||
      obj._id ||
      obj.userId ||
      ""
  );
};

const getName = (user) => {
  if (!user) {
    return "User";
  }

  return (
    user.name ||
    user.fullName ||
    user.email ||
    "User"
  );
};

const initials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

const getConversationUser = (item) => {
  if (!item) {
    return null;
  }

  return (
    item.user ||
    item.otherUser ||
    item.contact ||
    item.sender ||
    item.receiver ||
    null
  );
};

const getMessageText = (item) => {
  if (!item) {
    return "";
  }

  return (
    item?.lastMessage?.text ||
    item?.lastMessage?.message ||
    item?.text ||
    item?.message ||
    ""
  );
};

const normalizeList = (value) =>
  Array.isArray(value) ? value : [];

// =========================================================
// AVATAR
// =========================================================

function Avatar({ user, large = false }) {
  const name = getName(user);

  if (user?.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={name}
        className={`${
          large ? "h-12 w-12" : "h-10 w-10"
        } shrink-0 rounded-full border border-gray-200 object-cover`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${
        large
          ? "h-12 w-12 text-base"
          : "h-10 w-10 text-sm"
      } flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700`}
    >
      {initials(name)}
    </div>
  );
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function RecruiterMessages() {
  // =======================================================
  // AUTH
  // =======================================================

  const auth = useSelector(
    (state) => state.auth || {}
  );

  const currentUser = auth.user || null;

  const currentUserId =
    getId(currentUser) ||
    String(
      currentUser?.userId ||
        auth.userId ||
        ""
    );

  const token =
    auth.token ||
    auth.accessToken ||
    getToken();

  // =======================================================
  // STATE
  // =======================================================

  const [conversations, setConversations] =
    useState([]);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    conversationLoading,
    setConversationLoading,
  ] = useState(false);

  const [sending, setSending] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // =======================================================
  // REFS
  // =======================================================

  const searchTimerRef =
    useRef(null);

  const conversationRequestRef =
    useRef(0);

  const conversationLoadingRef =
    useRef(false);

  // =======================================================
  // LOAD INBOX
  // =======================================================

  const loadInbox = useCallback(
    async (showLoader = false) => {
      if (!token) {
        setLoading(false);
        setRefreshing(false);
        setError(
          "Please login as recruiter."
        );
        return;
      }

      try {
        if (showLoader) {
          setRefreshing(true);
        }

        setError("");

        const trimmedSearch =
          search.trim();

        const query = trimmedSearch
          ? `?search=${encodeURIComponent(
              trimmedSearch
            )}&page=1&limit=100`
          : "?page=1&limit=100";

        const data = await apiRequest(
          `/messages${query}`,
          "GET",
          null,
          token
        );

        const list =
          data?.conversations ||
          data?.messages ||
          data?.data ||
          [];

        const normalized =
          normalizeList(list).filter(
            (item) => {
              const user =
                getConversationUser(item);

              return Boolean(
                user && getId(user)
              );
            }
          );

        setConversations(normalized);

        // Keep selected user synchronized
        // with the latest inbox data when possible.
        if (selectedUser) {
          const selectedId =
            getId(selectedUser);

          const updatedItem =
            normalized.find(
              (item) =>
                getId(
                  getConversationUser(item)
                ) === selectedId
            );

          const updatedUser =
            updatedItem
              ? getConversationUser(
                  updatedItem
                )
              : null;

          if (updatedUser) {
            setSelectedUser(updatedUser);
          }
        }
      } catch (err) {
        console.error(
          "Unable to load messages:",
          err
        );

        setError(
          err?.message ||
            "Unable to load messages."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, token, selectedUser]
  );

  // =======================================================
  // LOAD CONVERSATION
  // =======================================================

  const loadConversation = useCallback(
    async (
      user,
      markAsRead = true
    ) => {
      const userId = getId(user);

      if (!userId || !token) {
        return;
      }

      // Prevent overlapping polling requests.
      if (
        conversationLoadingRef.current
      ) {
        return;
      }

      const requestId =
        conversationRequestRef.current + 1;

      conversationRequestRef.current =
        requestId;

      conversationLoadingRef.current =
        true;

      try {
        setConversationLoading(true);

        setError("");

        const data = await apiRequest(
          `/messages/conversation/${encodeURIComponent(
            userId
          )}`,
          "GET",
          null,
          token
        );

        // Ignore stale responses.
        if (
          requestId !==
          conversationRequestRef.current
        ) {
          return;
        }

        const list =
          data?.messages ||
          data?.data ||
          (Array.isArray(data)
            ? data
            : []);

        setMessages(
          normalizeList(list)
        );

        // Mark conversation as read.
        if (markAsRead) {
          try {
            await apiRequest(
              `/messages/read/${encodeURIComponent(
                userId
              )}`,
              "PATCH",
              null,
              token
            );

            setConversations(
              (previous) =>
                previous.map((item) => {
                  const conversationUser =
                    getConversationUser(
                      item
                    );

                  if (
                    getId(
                      conversationUser
                    ) === userId
                  ) {
                    return {
                      ...item,
                      unreadCount: 0,
                    };
                  }

                  return item;
                })
            );
          } catch (readError) {
            console.error(
              "Unable to mark conversation as read:",
              readError
            );
          }
        }
      } catch (err) {
        if (
          requestId !==
          conversationRequestRef.current
        ) {
          return;
        }

        console.error(
          "Unable to load conversation:",
          err
        );

        setError(
          err?.message ||
            "Unable to load conversation."
        );
      } finally {
        conversationLoadingRef.current =
          false;

        if (
          requestId ===
          conversationRequestRef.current
        ) {
          setConversationLoading(false);
        }
      }
    },
    [token]
  );

  // =======================================================
  // INITIAL / SEARCH LOAD
  // =======================================================

  useEffect(() => {
    clearTimeout(
      searchTimerRef.current
    );

    searchTimerRef.current =
      setTimeout(() => {
        loadInbox();
      }, 350);

    return () => {
      clearTimeout(
        searchTimerRef.current
      );
    };
  }, [search, loadInbox]);

  // =======================================================
  // AUTO REFRESH SELECTED CONVERSATION
  // =======================================================

  useEffect(() => {
    if (!selectedUser) {
      return undefined;
    }

    const timer = setInterval(() => {
      loadConversation(
        selectedUser,
        false
      );
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [
    selectedUser,
    loadConversation,
  ]);

  // =======================================================
  // SELECT CONVERSATION
  // =======================================================

  const selectConversation = (
    item
  ) => {
    const user =
      getConversationUser(item);

    const userId = getId(user);

    if (!user || !userId) {
      return;
    }

    // Invalidate previous request.
    conversationRequestRef.current += 1;

    conversationLoadingRef.current =
      false;

    setSelectedUser(user);
    setMessages([]);
    setText("");
    setError("");

    loadConversation(
      user,
      true
    );
  };

  // =======================================================
  // SEND MESSAGE
  // =======================================================

  const sendMessage = async (
    event
  ) => {
    event.preventDefault();

    const messageText =
      text.trim();

    const receiverId =
      getId(selectedUser);

    if (
      !receiverId ||
      !messageText ||
      sending ||
      !token
    ) {
      return;
    }

    try {
      setSending(true);

      setError("");

      await apiRequest(
        "/messages",
        "POST",
        {
          receiverId,
          text: messageText,
        },
        token
      );

      setText("");

      await loadConversation(
        selectedUser,
        false
      );

      await loadInbox();
    } catch (err) {
      console.error(
        "Message could not be sent:",
        err
      );

      setError(
        err?.message ||
          "Message could not be sent."
      );
    } finally {
      setSending(false);
    }
  };

  // =======================================================
  // DELETE MESSAGE
  // =======================================================

  const deleteMessage = async (
    messageId
  ) => {
    if (!messageId || !token) {
      return;
    }

    if (
      !window.confirm(
        "Delete this message?"
      )
    ) {
      return;
    }

    try {
      setError("");

      await apiRequest(
        `/messages/${encodeURIComponent(
          messageId
        )}`,
        "DELETE",
        null,
        token
      );

      setMessages(
        (previous) =>
          previous.filter(
            (message) =>
              getId(message) !==
              String(messageId)
          )
      );

      await loadInbox();
    } catch (err) {
      console.error(
        "Unable to delete message:",
        err
      );

      setError(
        err?.message ||
          "Unable to delete message."
      );
    }
  };

  // =======================================================
  // CLOSE CONVERSATION
  // =======================================================

  const closeConversation = () => {
    conversationRequestRef.current += 1;

    conversationLoadingRef.current =
      false;

    setSelectedUser(null);
    setMessages([]);
    setText("");
    setError("");
    setConversationLoading(false);
  };

  // =======================================================
  // REFRESH
  // =======================================================

  const refreshInbox = async () => {
    await loadInbox(true);

    if (selectedUser) {
      await loadConversation(
        selectedUser,
        false
      );
    }
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            PAGE HEADER
        ================================================== */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Messages
          </h1>

          <p className="mt-1 text-gray-500">
            Communicate with candidates.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* =================================================
            MESSAGES CONTAINER
        ================================================== */}

        <div className="flex h-[650px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* =================================================
              CONVERSATIONS
          ================================================== */}

          <div
            className={`flex w-full flex-col border-r border-gray-200 md:w-[350px] ${
              selectedUser
                ? "hidden md:flex"
                : "flex"
            }`}
          >

            {/* SEARCH */}

            <div className="border-b border-gray-200 p-4">
              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search messages..."
                  className="w-full rounded-xl border border-transparent bg-gray-100 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:bg-white"
                  maxLength={100}
                  aria-label="Search messages"
                  autoComplete="off"
                />

              </div>
            </div>

            {/* CONVERSATION LIST */}

            <div className="flex-1 overflow-y-auto">

              {loading ? (
                <div className="flex h-full items-center justify-center text-gray-500">

                  <Loader2
                    size={20}
                    className="mr-2 animate-spin"
                  />

                  Loading...

                </div>
              ) : conversations.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-4 text-center text-gray-400">

                  <MessageCircle size={45} />

                  <p className="mt-3">
                    {search.trim()
                      ? "No matching conversations"
                      : "No conversations"}
                  </p>

                </div>
              ) : (
                conversations.map(
                  (item, index) => {
                    const user =
                      getConversationUser(
                        item
                      );

                    const userId =
                      getId(user);

                    if (
                      !user ||
                      !userId
                    ) {
                      return null;
                    }

                    const active =
                      getId(
                        selectedUser
                      ) === userId;

                    const unreadCount =
                      Number(
                        item?.unreadCount ||
                          0
                      );

                    return (
                      <button
                        key={
                          userId ||
                          `conversation-${index}`
                        }
                        type="button"
                        onClick={() =>
                          selectConversation(
                            item
                          )
                        }
                        className={`w-full border-b border-gray-100 p-4 text-left transition hover:bg-gray-50 ${
                          active
                            ? "bg-blue-50"
                            : ""
                        }`}
                        aria-label={`Open conversation with ${getName(
                          user
                        )}`}
                      >

                        <div className="flex gap-3">

                          <Avatar
                            user={user}
                          />

                          <div className="min-w-0 flex-1">

                            <div className="flex items-center justify-between gap-2">

                              <h3 className="truncate font-semibold text-gray-900">
                                {getName(
                                  user
                                )}
                              </h3>

                              {unreadCount >
                                0 && (
                                <span
                                  className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1 text-xs text-white"
                                  aria-label={`${unreadCount} unread messages`}
                                >
                                  {unreadCount >
                                  99
                                    ? "99+"
                                    : unreadCount}
                                </span>
                              )}

                            </div>

                            <p className="mt-1 truncate text-sm text-gray-500">
                              {getMessageText(
                                item
                              ) ||
                                "No messages"}
                            </p>

                          </div>

                        </div>

                      </button>
                    );
                  }
                )
              )}

            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={refreshInbox}
              disabled={refreshing}
              className="m-3 flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}

            </button>

          </div>

          {/* =================================================
              CHAT
          ================================================== */}

          <div
            className={`flex-1 flex-col ${
              selectedUser
                ? "flex"
                : "hidden md:flex"
            }`}
          >

            {!selectedUser ? (
              <div className="flex flex-1 flex-col items-center justify-center px-4 text-center text-gray-400">

                <MessageCircle size={55} />

                <h2 className="mt-4 text-lg font-semibold text-gray-600">
                  Select a conversation
                </h2>

                <p className="mt-1 text-sm">
                  Choose a candidate from your
                  conversations.
                </p>

              </div>
            ) : (
              <>

                {/* CHAT HEADER */}

                <div className="flex items-center gap-3 border-b border-gray-200 p-4">

                  <button
                    type="button"
                    onClick={
                      closeConversation
                    }
                    className="rounded-lg p-1 transition hover:bg-gray-100 md:hidden"
                    aria-label="Back to conversations"
                    title="Back"
                  >
                    <ArrowLeft
                      size={20}
                    />
                  </button>

                  <Avatar
                    user={selectedUser}
                    large
                  />

                  <div className="min-w-0 flex-1">

                    <h2 className="truncate font-bold text-gray-900">
                      {getName(
                        selectedUser
                      )}
                    </h2>

                    <p className="truncate text-sm text-gray-500">
                      {selectedUser?.email ||
                        "User"}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      loadConversation(
                        selectedUser,
                        true
                      )
                    }
                    disabled={
                      conversationLoading
                    }
                    className="hidden rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:block"
                    aria-label="Refresh conversation"
                    title="Refresh conversation"
                  >
                    <RefreshCw
                      size={18}
                      className={
                        conversationLoading
                          ? "animate-spin"
                          : ""
                      }
                    />
                  </button>

                </div>

                {/* =================================================
                    MESSAGES
                ================================================== */}

                <div
                  className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4"
                  aria-live="polite"
                >

                  {conversationLoading &&
                  messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-gray-500">

                      <Loader2
                        size={22}
                        className="animate-spin"
                      />

                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">

                      <MessageCircle
                        size={40}
                      />

                      <p className="mt-3">
                        No messages yet.
                      </p>

                      <p className="mt-1 text-sm">
                        Start the conversation
                        below.
                      </p>

                    </div>
                  ) : (
                    messages.map(
                      (
                        message,
                        index
                      ) => {

                        const senderId =
                          getId(
                            message?.sender
                          );

                        const messageId =
                          getId(
                            message
                          );

                        /*
                         * IMPORTANT:
                         * A message belongs to the recruiter
                         * only when its sender matches the
                         * currently authenticated user's ID.
                         *
                         * Do NOT use:
                         * senderId !== selectedId
                         *
                         * because that would incorrectly mark
                         * third-party messages as recruiter messages.
                         */

                        const mine =
                          Boolean(
                            currentUserId &&
                            senderId &&
                            senderId ===
                              currentUserId
                          );

                        const messageKey =
                          messageId ||
                          `${senderId || "unknown"}-${
                            message?.createdAt ||
                            index
                          }-${index}`;

                        return (
                          <div
                            key={
                              messageKey
                            }
                            className={`flex ${
                              mine
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >

                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                                mine
                                  ? "rounded-br-sm bg-blue-600 text-white"
                                  : "rounded-bl-sm border border-gray-200 bg-white text-gray-900"
                              }`}
                            >

                              <p className="whitespace-pre-wrap break-words">
                                {message?.text ||
                                  message?.message ||
                                  ""}
                              </p>

                              <div
                                className={`mt-2 flex items-center justify-between gap-4 text-xs ${
                                  mine
                                    ? "text-white/70"
                                    : "text-gray-400"
                                }`}
                              >

                                <span>
                                  {message?.createdAt
                                    ? formatMessageDate(
                                        message.createdAt
                                      )
                                    : ""}
                                </span>

                                {mine &&
                                  messageId && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteMessage(
                                          messageId
                                        )
                                      }
                                      className="rounded p-1 transition hover:bg-white/10 hover:opacity-80"
                                      aria-label="Delete message"
                                      title="Delete message"
                                    >
                                      <Trash2
                                        size={
                                          14
                                        }
                                      />
                                    </button>
                                  )}

                              </div>

                            </div>

                          </div>
                        );
                      }
                    )
                  )}

                </div>

                {/* =================================================
                    SEND MESSAGE
                ================================================== */}

                <form
                  onSubmit={
                    sendMessage
                  }
                  className="border-t border-gray-200 p-4"
                >

                  <div className="flex items-end gap-3">

                    <textarea
                      value={text}
                      onChange={(event) =>
                        setText(
                          event.target.value
                        )
                      }
                      placeholder="Write a message..."
                      className="max-h-32 min-h-[48px] flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                      maxLength={5000}
                      disabled={sending}
                      aria-label="Message text"
                      rows={1}
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                            "Enter" &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();

                          if (
                            text.trim() &&
                            !sending
                          ) {
                            event.currentTarget.form?.requestSubmit();
                          }
                        }
                      }}
                    />

                    <button
                      type="submit"
                      disabled={
                        !text.trim() ||
                        sending ||
                        !selectedUser
                      }
                      className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Send message"
                      title="Send message"
                    >
                      {sending ? (
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />
                      ) : (
                        <Send
                          size={19}
                        />
                      )}
                    </button>

                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    Press Enter to send. Use
                    Shift + Enter for a new line.
                  </p>

                </form>

              </>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

// =========================================================
// MESSAGE DATE
// =========================================================

function formatMessageDate(
  value
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}