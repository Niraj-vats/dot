import MessageApi from "../apis/messageAPis.js";

class ChatService {
    constructor(apiBaseUrl) {
        this.messageApi = new MessageApi(apiBaseUrl);
    }

    async sendMessage(from, to, content) {
        return this.messageApi.sendMessage(from, to, content);
    }
    async uploadFile(from, to, file) {
        return this.messageApi.uploadFile(from, to, file);
    }
}

export default ChatService