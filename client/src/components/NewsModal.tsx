import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

interface NewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewsModal({ open, onOpenChange }: NewsModalProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAnnouncements();
    }
  }, [open]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/announcements?limit=50");
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.log("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Latest News & Announcements</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            data-testid="button-close-news-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Loading announcements...</div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">No announcements yet</div>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-4 bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-600 rounded hover:shadow-md transition-shadow"
                  data-testid={`announcement-${announcement.id}`}
                >
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm leading-relaxed">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    {new Date(announcement.createdAt).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
