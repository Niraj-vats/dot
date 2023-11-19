//testing for the notification component
class ServeNotification {
    constructor() {
        this.notificationElement = this.createNotificationElement();
    }

    createNotificationElement() {
        const notification = document.createElement("div");
        notification.classList.add("chat-notification");
        notification.style.display = "none"; // hide by default
        return notification;
    }

    showNotification(message) {
        this.notificationElement.textContent = message;
        this.notificationElement.style.display = "block";
    }

    hideNotification() {
        this.notificationElement.style.display = "none";
    }
    pushBrowserNotification({ content, title, tag, logo }) {
        if (Notification.permission === 'granted') {
            const notificationOptions = {
                body: content,
                icon: logo,
                tag: tag || "default-tag"
            };

            const browserNotification = new window.Notification(title, notificationOptions);
            browserNotification.onclick = () => {
                // Perform action to focus or open chat window
                window.focus();
                window.location.href = 'http://localhost:3000/friends';
                // window.location.href = 'http://chat.0dot1.in/friends';
            };
        }
    }
}
export default ServeNotification;