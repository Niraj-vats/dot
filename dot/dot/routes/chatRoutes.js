const express = require('express');
const router = express.Router();
const multer = require('multer');
const ChatController = require('../controllers/ChatController');
const { GridFsStorage } = require('multer-gridfs-storage');
const chatController = new ChatController();

//testing FOR FILE UPLOAD DEEPAK
const storage = new GridFsStorage({
    // url: 'mongodb://127.0.0.1:27017/shunyaComm',
    url: 'mongodb+srv://nodejsDeepak:nodejsDeepak@cluster0.lnx1ekk.mongodb.net/shunyaComm?',
    file: (req, file) => {
        return {
            filename: file.originalname,
            bucketName: 'chatmessages' // Must match the collection name
        };
    }
});
const upload = multer({ storage });
router.post('/uploadFile', upload.single('chatFile'), chatController.uploadFile.bind(chatController));
router.get('/download/:fileId', chatController.downloadFile);

// Send chat message
// router.post('/markAsSeen/:userId/:otherUserId', chatController.markAsSeen);
router.post('/markAsSeen/:sender/:receiver', chatController.markAsSeen.bind(chatController));

router.post('/send', chatController.sendMessage);
// Edit chat message
router.put('/edit/:messageId', async (req, res) => {
    chatController.editMessage(req, res);
});


router.get('/fetchMessages/:userId/:otherUserId', chatController.fetchMessages);

// router.get('/:userId/:otherUserId', chatController.getChatMessages);


module.exports = router;