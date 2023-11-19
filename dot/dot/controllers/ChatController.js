const ChatService = require('../services/ChatService');
const fs = require('fs');  // Node.js native file system module
const path = require('path');  // Node.js native path module
const mongodb = require('mongodb');  // MongoDB driver
const MongoClient = mongodb.MongoClient;
class ChatController {
    constructor() {
        this.chatService = new ChatService();
        // console.log("ChatService initialized: ", !!this.chatService);
        this.fetchMessages = this.fetchMessages.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }

    // Send chat message
    async sendMessage(req, res) {
        try {
            const { from, to, content, file } = req.body;

            const message = await this.chatService.sendChatMessage(from, to, content, file);
            // WebSocket trigger event for new message
            // Implement WebSocket logic here
            let ss = req.ss
            ss.sendMessageToUser(to, message.getMessage())
            res.status(201).json({ _id: message._id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    }

    // Edit chat message
    async editMessage(req, res) {
        try {
            const { messageId } = req.params;
            const { editedContent } = req.body;
            const updatedMessage = await this.chatService.editChatMessage(messageId, editedContent);

            // WebSocket trigger event for message edit
            // Implement WebSocket logic here

            res.status(200).json({ message: 'Message edited successfully', updatedMessage });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to edit message' });
        }
    }
    async getChatMessages(req, res) {
        try {
            const userId = req.params.userId;
            const otherUserId = req.params.otherUserId;

            const messages = await ChatService.getChatMessagesBetweenUsers(userId, otherUserId);
            res.status(200).json(messages);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch messages' });
        }
    }
    // Fetch chat messages between two users
    async fetchMessages(req, res) {
        try {
            const { userId, otherUserId } = req.params;
            const messages = await this.chatService.fetchChatMessagesBetweenUsers(userId, otherUserId);
            // console.log("Fetched messages from DB:", messages);

            res.status(200).json(messages);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch messages' });
        }
    }

    async markAsSeen(req, res) {

        try {
            console.log("Inside markAsSeen, chatService is:");
            const { sender, receiver } = req.params;
            console.log(req.params);
            await this.chatService.markAsSeenM(sender, receiver);
            let ss = req.ss;
            ss.sendSeenAcknowledgementToUser(sender, receiver);
            res.status(200).json({ message: 'Messages marked as seen successfully' });
        } catch (error) {
            console.error(error);
            // res.status(500).json({ error: 'Failed to mark messages as seen' });
            res.status(500).json({ error: 'Failed to mark messages as seen', details: error.message });

        }
    }

    async uploadFile(req, res) {
        try {
            const file = req.file;
            const { from, to } = req.body;  // sender and receiver ids

            if (!file) {
                return res.status(400).json({ error: 'File upload failed' });
            }

            // Here, save the message with the file metadata into MongoDB
            const message = await this.chatService.sendChatMessage(from, to, "File", {
                url: `/download/${file.id}`,  // Endpoint for file download
                name: file.originalname,
                size: file.size,
                type: file.mimetype
            });
            let ss = req.ss
            ss.sendMessageToUser(to, message.getMessage())
            res.status(201).json({ _id: message._id });
            // res.status(200).json({ message: 'File uploaded successfully', messageId: message._id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to upload file' });
        }
    }
    async downloadFile(req, res) {
        try {
            const { fileId } = req.params;

            if (!mongodb.ObjectId.isValid(fileId)) {
                return res.status(400).json({ error: 'Invalid fileId format' });
            }

            const client = await MongoClient.connect('mongodb+srv://nodejsDeepak:nodejsDeepak@cluster0.lnx1ekk.mongodb.net/shunyaComm?');
            if (!client) {
                return res.status(500).json({ error: 'Failed to connect to MongoDB' });
            }

            const db = client.db('shunyaComm');
            const bucket = new mongodb.GridFSBucket(db, { bucketName: 'chatmessages' });
            console.log("bucket mein se ye mila ", bucket);

            const file = await db.collection('chatmessages.files').findOne({ _id: mongodb.ObjectId(fileId) });
            if (!file) {
                return res.status(404).json({ error: 'File not found' });
            }
            console.log("file ye mili hai : ", file);

            res.setHeader('Content-Type', file.contentType);
            res.setHeader('Content-Disposition', 'attachment; filename=' + file.filename);

            const downloadStream = bucket.openDownloadStream(mongodb.ObjectId(fileId));

            // Add error handling for the download stream
            downloadStream.on('error', (err) => {
                console.error('Download stream error:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            });

            downloadStream.pipe(res);

        } catch (error) {
            console.error('An error occurred:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }



}

module.exports = ChatController;
