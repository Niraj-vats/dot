import { CookieService } from "../services/CookieServices.js";

class MessageApi {
    constructor(apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl; // Base URL of the message API
        this.cookieService = new CookieService()
    }


    async sendMessage(from, to, content) {
        try {
            const authToken = this.cookieService.getCookie("token")

            if (!authToken) {
                console.error('Auth token not found in cookies');
                return false;
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            };

            const messageData = {
                from,
                to,
                content
            };

            console.log(messageData);

            const response = await fetch("/chat/send", {
                method: 'POST',
                headers,
                body: JSON.stringify(messageData)
            });

            if (!response.ok) {
                throw new Error(`Error sending message: ${response.status}`);
            }

            let json = await response.json()
            // Message sent successfully
            return json;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }

    async uploadFile(from, to, file) {
        try {
            const authToken = this.cookieService.getCookie("token");

            if (!authToken) {
                console.error('Auth token not found in cookies');
                return false;
            }

            const headers = {
                'Authorization': `Bearer ${authToken}`
            };

            const formData = new FormData();
            formData.append('from', from);
            formData.append('to', to);
            formData.append('chatFile', file);

            const response = await fetch("/chat/uploadFile", {
                method: 'POST',
                headers,
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Error uploading file: ${response.status}`);
            }

            let json = await response.json();
            // console.log("jsong mein ye ye hai : ", json._id);
            return json;
        } catch (error) {
            console.error('Error uploading file:', error);
            return false;
        }
    }

}

export default MessageApi