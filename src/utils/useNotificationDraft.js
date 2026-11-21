/**
 * useNotificationDraft
 *
 * Manages the notification draft state used in create modals.
 * Call sendIfEnabled() after a successful create to fire the notification.
 *
 * Usage:
 *   const { notif, setNotif, sendIfEnabled, resetNotif } = useNotificationDraft("place");
 *
 *   // Inside modal: <NotificationDraftSection serviceType="place" value={notif} onChange={setNotif} entityName={form.name} />
 *
 *   // After successful create:
 *   await sendIfEnabled({ serviceId: createdRecord._id });
 */

import { useState, useCallback } from "react";
import { sendNotification } from "../api/notification.api";
import toast from "react-hot-toast";

const INITIAL = { title: "", message: "", send: true };

export const useNotificationDraft = (serviceType = "general") => {
  const [notif, setNotif] = useState(INITIAL);

  const resetNotif = useCallback(() => setNotif(INITIAL), []);

  /**
   * sendIfEnabled — call this after a successful create mutation.
   * @param {{ serviceId?: string }} opts
   */
  const sendIfEnabled = useCallback(
    async ({ serviceId } = {}) => {
      if (!notif.send || !notif.title?.trim() || !notif.message?.trim()) return;

      try {
        await sendNotification({
          title: notif.title.trim(),
          message: notif.message.trim(),
          type: serviceType === "event" || serviceType === "surprise_event" ? "EVENT" : "SERVICE",
          serviceType,
          serviceId: serviceId || undefined,
          // no userIds = broadcast to all
        });
        toast.success("📢 Broadcast notification sent to all users!");
      } catch {
        toast.error("⚠️ Record saved but notification failed to send.");
      }
    },
    [notif, serviceType]
  );

  return { notif, setNotif, sendIfEnabled, resetNotif };
};
