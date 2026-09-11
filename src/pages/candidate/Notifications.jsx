import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/notifications?limit=50`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load notifications"
        );
      }

      setNotifications(
        Array.isArray(data.notifications)
          ? data.notifications
          : []
      );
    } catch (err) {
      console.error("Notification Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      if (!token) return;

      const response = await fetch(
        `${API_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark notification as read"
        );
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Mark Notification Error:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!token) return;

      setMarkingAll(true);

      const response = await fetch(
        `${API_URL}/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to mark all notifications"
        );
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (err) {
      console.error("Mark All Notification Error:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const formatDate = (date) => {
    if (!date) return "";

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    const now = new Date();
    const diff = now - notificationDate;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    return notificationDate.toLocaleDateString();
  };

  const getIcon = (type) => {
    switch (type) {
      case "application":
        return "📄";

      case "application_status":
        return "📋";

      case "interview":
        return "📅";

      case "message":
        return "💬";

      case "job":
        return "💼";

      default:
        return "🔔";
    }
  };

  const getIconBackground = (type) => {
    switch (type) {
      case "application":
        return "bg-blue-50";

      case "application_status":
        return "bg-purple-50";

      case "interview":
        return "bg-green-50";

      case "message":
        return "bg-yellow-50";

      case "job":
        return "bg-orange-50";

      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Stay updated with your latest activity
            </p>
          </div>

          <button
            onClick={() => navigate("/candidate/dashboard")}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-6 py-8">

        {/* Top Card */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                All Notifications
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount > 1 ? "s" : ""
                    }`
                  : "You're all caught up"}
              </p>
            </div>

            <button
              onClick={markAllAsRead}
              disabled={markingAll || unreadCount === 0}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                unreadCount === 0 || markingAll
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {markingAll
                ? "Marking..."
                : "Mark all as read"}
            </button>

          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800"></div>

            <p className="text-sm text-gray-500">
              Loading notifications...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <div className="mb-2 text-3xl">⚠️</div>

            <h3 className="font-semibold text-red-800">
              Unable to load notifications
            </h3>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={fetchNotifications}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          notifications.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">

              <div className="mb-4 text-5xl">
                🔔
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                No Notifications
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                You don't have any notifications yet.
                We'll let you know when there is new
                activity on your account.
              </p>

              <button
                onClick={() =>
                  navigate("/candidate/dashboard")
                }
                className="mt-6 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Back to Dashboard
              </button>

            </div>
          )}

        {/* Notifications List */}
        {!loading &&
          !error &&
          notifications.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

              {notifications.map((notification, index) => (
                <div
                  key={notification._id}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification._id);
                    }
                  }}
                  className={`flex cursor-pointer gap-4 p-5 transition hover:bg-gray-50 ${
                    index !== notifications.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  } ${
                    !notification.read
                      ? "bg-blue-50/30"
                      : "bg-white"
                  }`}
                >

                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl ${getIconBackground(
                      notification.type
                    )}`}
                  >
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">

                      <div className="flex items-center gap-2">

                        <h3
                          className={`text-sm ${
                            notification.read
                              ? "font-medium text-gray-800"
                              : "font-semibold text-gray-900"
                          }`}
                        >
                          {notification.title ||
                            "Notification"}
                        </h3>

                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                        )}

                      </div>

                      <span className="shrink-0 text-xs text-gray-400">
                        {formatDate(
                          notification.createdAt
                        )}
                      </span>

                    </div>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {notification.message ||
                        notification.description ||
                        "You have a new notification."}
                    </p>

                  </div>

                </div>
              ))}

            </div>
          )}

      </main>
    </div>
  );
}

export default Notifications;