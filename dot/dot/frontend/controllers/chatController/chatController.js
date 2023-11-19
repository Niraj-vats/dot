import WebSocketService from "../../services/WsService.js";
import ChatService from "../../services/ChatService.js";
import ServeNotification from "../../services/NotificationService.js"


class ChatController {
    constructor(store) {
        this.controllerId = 'chat-controller';
        this.store = store;
        this.component = this.createChatPlaceholder();
        this.chatService = new ChatService();
        this.webSocketService = new WebSocketService("/"); // Inject the WebSocketService
        this.curentMessage = ''

        //notification - test
        this.notification = new ServeNotification();
        document.body.appendChild(this.notification.notificationElement); // Attach it to the body or any other container
        // notification browser - DEEPAK JOSHI

        this.selectedFile = null;  // Add this line
    }
    // notification browser - DEEPAK JOSHI
    async requestNotificationPermission() {
        console.log("permission dedo ji")
        if (Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            // console.log("permission milgayi ")

            if (permission === 'denied') {
                console.error('Notification permission denied.');
            }
        }
    }
    createChatPlaceholder() {
        const chatControllerDiv = document.createElement("div");
        chatControllerDiv.id = this.controllerId;
        return chatControllerDiv;
    }

    async init() {
        console.log("Init method called");
        const user = this.store.getUser();
        const activeFriend = this.store.getActiveFriend();

        // Only load stored messages if user and activeFriend are set
        if (user && activeFriend) {
            await this.loadStoredMessages();
        }

        this.appendChatToComponent();
        this.initWebSocket();
        // Listen to incoming messages and other events from WebSocket
        this.listenToWebSocketEvents();
        this.listenToMessages();
    }
    listenToWebSocketEvents() {

        // Listen to message delivery acknowledgments
        this.webSocketService.socket.on('message-delivered', (data) => {
            // Here, update the UI to reflect that the message has been delivered
            this.updateMessageStatusInChat(data.messageId, { isDelivered: true });
        });

        // Listen to message seen acknowledgments
        this.webSocketService.socket.on('message-seen', (data) => {
            // Here, update the UI to reflect that the message has been seen
            this.updateMessageStatusInChat(data.messageId, { isSeen: true });
        });

        // You can add more event listeners as required
    }
    // New method to fetch stored messages
    async loadStoredMessages() {
        this.requestNotificationPermission();
        const user = this.store.getUser();
        const activeFriend = this.store.getActiveFriend();
        const options = {
            method: 'POST',             // HTTP method
            headers: {
                'Content-Type': 'application/json' // Specify content type as JSON
            },
        };
        let isSuccessful = false;
        fetch("/chat/markAsSeen/" + user._id + "/" + activeFriend._id, options).then(response => {
            if (response.status === 200) {
                isSuccessful = true;
                return response.json();
            } else {
                throw new Error('Not a 200 response');
            }
        }).then(data => {
            console.log(data);
        }).catch(error => {
            console.error("There was an error with the fetch request:", error.message);
        })
        console.log("response api ", isSuccessful);

        // Check if user and activeFriend are not null
        if (!user || !activeFriend) {
            console.warn("User or active friend data is not available yet.");
            return;
        }

        const userId = user._id;
        const otherUserId = activeFriend._id;

        try {
            const response = await fetch(`/chat/fetchMessages/${userId}/${otherUserId}`);
            const messages = await response.json();
            if (messages.error) {
                console.error("Server returned an error:", messages.error);
                return;
            }
            // console.log("Received messages from server:", messages);

            // Store these messages in the `this.store`
            // console.log("ssss ", messages);
            messages.forEach(message => {
                this.store.addMessage(message.from, {
                    text: message.content,
                    sender: message.from === userId ? 'user' : 'friend',
                    timestamp: message.timestamp || new Date().toISOString(),
                    isSeen: message.isSeen || false,
                    isDelivered: message.isDelivered || false
                });
            });

            // Optionally, render these messages in the chat UI
            this.renderStoredMessages(messages);
        } catch (error) {
            console.error("Failed to load stored chat messages:", error);
        }
    }

    // Method to render the stored messages (can be integrated with your existing methods)
    renderStoredMessages(messages) {
        console.log("messages ki aise taise , ", messages);
        const chatMessagesContainer = this.component.querySelector(".chat-messages");
        if (chatMessagesContainer) {
            messages.forEach((message) => {
                const text = message.timeline[message.timeline.length - 1].content; // Extract text
                const timestamp = message.timeline[message.timeline.length - 1].date; // Extract timestamp
                const isSeen = message.isSeen || false;
                const isDelivered = message.isDelivered || false;

                // Check if this is a file message
                if (message.file && message.file.url) {
                    this.appendMessageToChat(chatMessagesContainer, {
                        file: message.file,
                        sender: message.from === this.store.getUser()._id ? 'user' : 'friend',
                        timestamp,
                        isSeen,
                        isDelivered
                    });
                } else {
                    this.appendMessageToChat(chatMessagesContainer, {
                        text,
                        sender: message.from === this.store.getUser()._id ? 'user' : 'friend',
                        timestamp,
                        isSeen,
                        isDelivered
                    });
                }
            });
        }
    }


    appendChatToComponent() {
        if (this.component) {
            const chatUI = this.createChatUI();
            this.component.appendChild(chatUI);
        }
    }

    getLastUserMessage() {
        const messages = this.store.getMessages();
        const lastUserMessage = messages.reverse().find(message => message.sender === 'user');
        return lastUserMessage ? lastUserMessage.text : "";
    }

    createChatUI() {
        const chatUIContainer = document.createElement("div");
        chatUIContainer.classList.add("chat-ui-container");

        if (!this.store.getActiveFriend()) {
            chatUIContainer.appendChild(this.createEmptyChatContainer());
        } else {
            this.activeFriend = this.store.getActiveFriend();
            chatUIContainer.appendChild(this.createChatHeader());
            chatUIContainer.appendChild(this.createChatMessagesContainer());
            chatUIContainer.appendChild(this.createChatInputContainer());
        }
        return chatUIContainer;
    }


    // Create the empty chat container
    createEmptyChatContainer() {
        const emptyChatContainer = document.createElement("div");
        emptyChatContainer.classList.add("empty-chat-container");

        const chatComponentPlaceholder = document.createElement("div");
        chatComponentPlaceholder.classList.add("empty-chat-component");

        const heading = document.createElement("h1");
        heading.textContent = "Welcome, User";
        const paragraph = document.createElement("p");
        paragraph.textContent = "Ready? Set. Chat! Let's jump right into things.";

        const headerAndParaContainer = document.createElement('span');
        headerAndParaContainer.classList.add('headerandpara');
        headerAndParaContainer.appendChild(heading);
        headerAndParaContainer.appendChild(paragraph);

        const imagesContainer = document.createElement('div');
        imagesContainer.classList.add('images');
        //pic1
        const pic1Img = document.createElement('div');
        pic1Img.classList.add('img');
        const pic1 = document.createElement('img');
        pic1.setAttribute('src','../styles/Images/pic1.png');
        const pic1Msg = document.createElement('span');
        pic1Msg.textContent="Send a message to a colleague or friend";
        const pic1Btn = document.createElement('button');
        pic1Btn.textContent ="Start a chat";
        //pic2
        const pic2Img = document.createElement('div');
        pic2Img.classList.add('img');
        const pic2 = document.createElement('img');
        pic2.setAttribute('src','../styles/Images/pic2.png');
        const pic2Msg = document.createElement('span');
        pic2Msg.textContent="Collaborate on projects with teams or groups";
        const pic2Btn = document.createElement('button');
        pic2Btn.textContent ="Browse spaces";

        //pic3
        const pic3Img = document.createElement('div');
        pic3Img.classList.add('img');
        const pic3 = document.createElement('img');
        pic3.setAttribute('src','../styles/Images/pic3.png');
        const pic3Msg = document.createElement('span');
        pic3Msg.textContent="Find tools to upgrade your workflows";
        const pic3Btn = document.createElement('button');
        pic3Btn.textContent ="Explore apps";

        pic1Img.appendChild(pic1);
        pic1Img.appendChild(pic1Msg);
        pic1Img.appendChild(pic1Btn);

        pic2Img.appendChild(pic2);
        pic2Img.appendChild(pic2Msg);
        pic2Img.appendChild(pic2Btn);

        pic3Img.appendChild(pic3);
        pic3Img.appendChild(pic3Msg);
        pic3Img.appendChild(pic3Btn);

        imagesContainer.appendChild(pic1Img);
        imagesContainer.appendChild(pic2Img);
        imagesContainer.appendChild(pic3Img);

        //Download Section
        const section = document.createElement('div');
        section.classList.add('section');

        const downloadMsg = document.createElement('p');
        downloadMsg.textContent = "Download the chat apps";

        const links = document.createElement('div');
        links.classList.add('links');

        const playStore = document.createElement('span');
        const playStoreIcon = document.createElement('i');
        playStoreIcon.classList.add('fa-brands','fa-google-play');
        const PlayStoreName = document.createTextNode('Play Store |');
        playStore.appendChild(playStoreIcon);
        playStore.appendChild(PlayStoreName);

        const AppStore = document.createElement('span');
        const AppStoreIcon = document.createElement('i');
        AppStoreIcon.classList.add('fa-brands','fa-app-store-ios');
        const AppStoreName = document.createTextNode('App Store |');
        AppStore.appendChild(AppStoreIcon);
        AppStore.appendChild(AppStoreName);

        const webApp = document.createElement('span');
        const webAppIcon = document.createElement('i');
        webAppIcon.classList.add('fa-brands','fa-chrome');
        const webAppName = document.createTextNode('Web App');
        webApp.appendChild(webAppIcon);
        webApp.appendChild(webAppName);

        links.appendChild(playStore);
        links.appendChild(AppStore);
        links.appendChild(webApp);

        section.appendChild(downloadMsg);
        section.appendChild(links);


        chatComponentPlaceholder.appendChild(headerAndParaContainer);
        chatComponentPlaceholder.appendChild(imagesContainer);
        chatComponentPlaceholder.appendChild(section);

        emptyChatContainer.appendChild(chatComponentPlaceholder);
        

        return emptyChatContainer;
    }


    // Create the chat header
    createChatHeader() {
        const chatHeader = document.createElement("div");
        chatHeader.classList.add("chat-header");

        // Create a container for friend's details (name and last message)
        const friendDetailsContainer = document.createElement("div");
        friendDetailsContainer.classList.add("friend-details-container");

        const backButtonContainer = document.createElement('div');
        backButtonContainer.classList.add('backBtnContainer');
        const backButton = document.createElement('i');
        backButton.classList.add('fa-solid','fa-arrow-left');

        backButtonContainer.appendChild(backButton);

        backButtonContainer.addEventListener('click', () => {
            this.hideChatUI();
        });

        const chevronDown = document.createElement('i');
        chevronDown.classList.add('fa-solid','fa-chevron-down');
        

        // Append friend name and last message to the container

        friendDetailsContainer.appendChild(backButtonContainer);
        friendDetailsContainer.appendChild(this.createProfilePic());
        friendDetailsContainer.appendChild(this.createFriendName());
        friendDetailsContainer.appendChild(chevronDown);
        // friendDetailsContainer.appendChild(this.createStatusDot());
        // friendDetailsContainer.appendChild(this.createLastUserMessageElement()); // Displaying the last message below the friend's name

        // chatHeader.appendChild(this.createProfilePic());

        // Added Code
        const otherFeatures = document.createElement('span');
        otherFeatures.classList.add('other-features');

        const videoCallIcon = document.createElement('i');
        videoCallIcon.classList.add('fa-solid','fa-video');
        const searchIcon = document.createElement('i');
        searchIcon.classList.add('fa-solid','fa-magnifying-glass');
        const minimizeIcon = document.createElement('i');
        minimizeIcon.classList.add('fa-solid','fa-minimize');

        otherFeatures.appendChild(videoCallIcon);
        otherFeatures.appendChild(searchIcon);
        otherFeatures.appendChild(minimizeIcon);
        // Added Code

        // chatHeader.appendChild(backButtonContainer); // Append the container to the chat header
        chatHeader.appendChild(friendDetailsContainer); // Append the container to the chat header
        chatHeader.appendChild(otherFeatures); // Append the container to the chat header

        return chatHeader;
    }

    // Create the profile picture element
    createProfilePic() {
        const profilePic = document.createElement("img");
        // profilePic.src = this.activeFriend.profilePic;
        profilePic.setAttribute('src',`../../styles/Images/${this.activeFriend.name}.jpg`);
        profilePic.alt = this.activeFriend.name;
        profilePic.classList.add("profile-pic");
        return profilePic;
    }

    // Create the friend name element
    createFriendName() {
        const friendName = document.createElement("span");
        friendName.textContent = this.activeFriend.name;
        friendName.classList.add("friend-name");
        return friendName;
    }

    // Create the status dot element
    createStatusDot() {
        const statusDot = document.createElement("div");
        statusDot.classList.add("status-dot", this.activeFriend.status === "active" ? "active-status" : "inactive-status");
        return statusDot;
    }

    // Create the chat messages container
    createChatMessagesContainer() {
        const chatMessagesContainer = document.createElement("ul");
        chatMessagesContainer.classList.add("chat-messages");
        const defaultMsgContainer = document.createElement("div");
        defaultMsgContainer.classList.add('defaultMsgContainer');

        var sImages = document.createElement('div');
        sImages.classList.add('s_images');
        var spaceImg = document.createElement('div');
        spaceImg.classList.add('space_img');
        var sChatLogo = document.createElement('img');
        sChatLogo.setAttribute('src','../../styles/Images/chat.jpg');
        var sChatMsg = document.createElement('span');
        sChatMsg.textContent = "You created this space yesterday";
        var sChatBtn = document.createElement('div');
        sChatBtn.classList.add('space_btn');
        var sAdd = document.createElement('button');
        var sAddText = document.createTextNode('Add people & apps');
        var sAddLogo = document.createElement('i');
        sAddLogo.classList.add('fa-solid','fa-user-plus');
        sAdd.appendChild(sAddLogo);
        sAdd.appendChild(sAddText);

        sAdd.appendChild(sAddLogo);
        sAdd.appendChild(sAddText);

        var sShare = document.createElement('button');
        var sShareText = document.createTextNode('Share a file');
        var sShareLogo = document.createElement('i');
        sShareLogo.classList.add('fa-brands','fa-google-drive');

        sShare.appendChild(sShareLogo);
        sShare.appendChild(sShareText);

        var sAssign = document.createElement('button');
        var sAssignText = document.createTextNode('Assign task');
        var sAssignLogo = document.createElement('i');
        sAssignLogo.classList.add('fa-regular','fa-circle-check');
        sAssign.appendChild(sAssignLogo);
        sAssign.appendChild(sAssignText);

        sChatBtn.appendChild(sAdd);
        sChatBtn.appendChild(sShare);
        sChatBtn.appendChild(sAssign);

        spaceImg.appendChild(sChatLogo);
        spaceImg.appendChild(sChatMsg);
        spaceImg.appendChild(sChatBtn);

        sImages.appendChild(spaceImg);

        var spaceSection = document.createElement('div');
        spaceSection.classList.add('space_section');
        var historyS = document.createElement('p');
        var historyText = document.createTextNode('HISTORY IS ON');
        var historylogo = document.createElement('i');
        historylogo.classList.add('fa-solid','fa-clock-rotate-left');

        historyS.appendChild(historylogo);
        historyS.appendChild(historyText);

        var spanMsg = document.createElement('span');
        spanMsg.textContent="Messages sent with history are saved";

        spaceSection.appendChild(historyS);
        spaceSection.appendChild(spanMsg);


        defaultMsgContainer.appendChild(sImages);
        defaultMsgContainer.appendChild(spaceSection);

        chatMessagesContainer.appendChild(defaultMsgContainer);

        // Append existing messages to the chat messages container
        const messages = this.store.getMessages();
        messages.forEach((message) => {
            this.appendMessageToChat(chatMessagesContainer, message);
        });

        return chatMessagesContainer;
    }

    async handleFileInput(event) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;  // Store the file
        }
    }

    // Create the chat input container
    createChatInputContainer() {
        const chatInputContainer = document.createElement("div");
        chatInputContainer.classList.add("chat-input");
        // for file upload , DEEPAK

        var plusSpaceSearch = document.createElement('i');
        plusSpaceSearch.classList.add('fa-solid','fa-circle-plus');


        const fileInputLabel = document.createElement('label');
        fileInputLabel.setAttribute('for','inputFile');
        const fileInputIcon = document.createElement('i');
        fileInputIcon.classList.add('fa-solid','fa-paperclip');
        fileInputLabel.appendChild(fileInputIcon);
        fileInputLabel.style.cursor = "pointer";


        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.setAttribute('id','inputFile');
        fileInput.style.display = "none";

        fileInput.classList.add("file-input");
        fileInput.addEventListener("change", this.handleFileInput.bind(this));

        // const fileButton = document.createElement("button");
        // fileButton.textContent = "+";
        // fileButton.classList.add("file-button");
        // fileButton.addEventListener("click", () => {
        //     fileInput.click();
        // });

        chatInputContainer.appendChild(plusSpaceSearch);
        // chatInputContainer.appendChild(fileButton);
        // chatInputContainer.appendChild(fileInputLabel);
        // chatInputContainer.appendChild(fileInput);
        //END FILE TEST
        chatInputContainer.appendChild(this.createMessageInput());
        chatInputContainer.appendChild(this.createSendButton());

        return chatInputContainer;
    }
    createMessageInput() {
        var sSearchMagnifier = document.createElement('i');
        sSearchMagnifier.classList.add('fa-solid','fa-magnifying-glass');

        const messageInput = document.createElement("input");
        messageInput.type = "text";
        messageInput.placeholder = "History is on";
        messageInput.classList.add("message-input");
        this.currentMessage = '';
        // Set the input value to the currentMessage
        messageInput.value = this.currentMessage;

        messageInput.addEventListener("change", (e) => {
            // Update the currentMessage when the input changes
            this.currentMessage = e.target.value;
            // console.log(this.currentMessage);
        });

        // Add keyup event to check for Enter key press
        messageInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                // Check if this.currentMessage is defined before trimming
                const message = (this.currentMessage || '').trim();
                if (message) {
                    this.sendMessage(message);
                    // Clear the input field after sending
                    this.currentMessage = '';
                    messageInput.value = '';
                }
            }
        });

    

        var laugh = document.createElement('i');
        laugh.classList.add('fa-regular','fa-face-laugh');
        var upload = document.createElement('i');
        upload.classList.add('fa-solid','fa-upload','icon1');
        var video = document.createElement('i');
        video.classList.add('fa-solid','fa-video','icon1');

        const iconContainer = document.createElement('span');
        iconContainer.appendChild(laugh);
        iconContainer.appendChild(upload);
        iconContainer.appendChild(video);

        const sSearch = document.createElement('div');
        sSearch.classList.add('s_search');

        sSearch.appendChild(sSearchMagnifier);
        sSearch.appendChild(messageInput);
        sSearch.appendChild(iconContainer);


        return sSearch;
    }

    async uploadFile() {
        if (this.selectedFile) {
            const file = this.selectedFile;
            const currentUser = this.store.getUser();
            const activeFriend = this.store.getActiveFriend();
            const formData = new FormData();
            formData.append('chatFile', file);
            formData.append('from', currentUser._id);
            formData.append('to', activeFriend._id);

            this.sendMessage("", file);

            // const response = await fetch('/chat/uploadFile', {
            //     method: 'POST',
            //     body: formData
            // });

            // const data = await response.json();

            // if (data.fileId) {
            //     const fileMessage = `Download File: /chat/download/${data.fileId}`;
            //     this.sendMessage(fileMessage);
            //     const chatMessagesContainer = this.component.querySelector(".chat-messages");
            //     if (chatMessagesContainer) {
            //         this.appendMessageToChat(chatMessagesContainer, {
            //             file: {
            //                 url: `/chat/download/${data.fileId}`,
            //                 name: file.name,
            //                 size: file.size,
            //                 type: file.type
            //             },
            //             sender: 'user',
            //             timestamp: new Date().toISOString(),
            //             isSeen: false,
            //             isDelivered: false
            //         });
            //     }
            // }
        }
    }

    // Create the send button
    // createSendButton() {
    //     const sendButton = document.createElement("button");
    //     sendButton.textContent = "Send";
    //     sendButton.classList.add("send-button");

    //     sendButton.addEventListener("click", () => {
    //         // Get the message from currentMessage
    //         const message = this.currentMessage.trim();

    //         if (message) {
    //             this.sendMessage(message);
    //             // Clear the input field after sending
    //             this.currentMessage = '';
    //             const messageInput = this.component.querySelector(".message-input");
    //             messageInput.value = '';
    //         }
    //     });

    //     return sendButton;
    // }

    createSendButton() {
        
        const sendButton = document.createElement("button");
        sendButton.classList.add('fa-solid','fa-paper-plane');
        // sendButton.textContent = "Send";
        sendButton.classList.add("send-button");

        sendButton.addEventListener("click", async () => {
            // Upload the file if it exists
            if (this.selectedFile) {
                await this.uploadFile();
                this.selectedFile = null;  // Clear the selected file
            }

            // Existing code to send text message
            const message = this.currentMessage.trim();
            if (message) {
                this.sendMessage(message);
                this.currentMessage = '';
                const messageInput = this.component.querySelector(".message-input");
                messageInput.value = '';
            }
            
        });

        return sendButton;
    }



    renderChat() {
        this.component.innerHTML = '';
        let chatComponent = this.createChatUI();
        this.component.appendChild(chatComponent);

        this.toggleChatDisplay();
    }

    getChatContainer() {
        return this.component;
    }

    showChatUI() {
        const chatUI = document.querySelector('.chat-ui-container');

        if (chatUI) {
            chatUI.style.display = 'flex';
            this.hideFriendList();
            this.scrollToBottom();

            // Emit chat-opened event when chat UI is shown
            const activeFriend = this.store.getActiveFriend();
            if (activeFriend) {
                this.webSocketService.socket.emit('chat-opened', activeFriend._id);
            }
        }
    }
    ///IMPORTANT
    hideFriendList() {
        const friendList = document.querySelector('.friends-list');
        const friendContainer = document.querySelector('#friend-controller');
        if (friendList) {
            friendList.style.display = 'none';
            friendList.style.width ="0";
            friendContainer.style.display ="none";
            this.component.classList.add('chat-open');
        }
    }

    hideChatUI() {
        const chatUI = this.component.querySelector('.chat-ui-container');
        const emptyContainer = this.component.querySelector('.empty-chat-container');
        if (chatUI) {
            chatUI.style.display = 'none';
            this.showFriendList();
        }
    }

    showFriendList() {
        const friendList = document.querySelector('.friends-list');
        const friendContainer = document.querySelector('#friend-controller');
        if (friendList) {
            friendList.style.display = 'block';
            friendList.style.width = 'unset';
            friendContainer.style.display = 'block';
            this.component.classList.remove('chat-open');
        }
    }

    toggleCloseButton() {
        const chatToggleButton = document.createElement('button');
        chatToggleButton.classList.add('chat-toggle-button');
        chatToggleButton.textContent = 'X';

        chatToggleButton.addEventListener('click', () => {
            this.hideChatUI();
        });

        const chatHeader = this.component.querySelector('.chat-header');
        chatHeader.appendChild(chatToggleButton);
    }

    scrollToBottom() {
        window.scrollTo(0, document.documentElement.scrollHeight || document.body.scrollHeight);
    }

    toggleChatDisplay() {
        const chatUI = this.component.querySelector('.chat-ui-container');
        const screenWidth = window.innerWidth;

        if (screenWidth <= 768 && chatUI && (chatUI.style.display === 'none' || chatUI.style.display === '')) {
            this.showChatUI();
            this.toggleCloseButton();
            this.scrollToBottom();
        }
    }


    initWebSocket() {
        this.webSocketService.connect();
    }

    // Listen to incoming messages from the WebSocket
    listenToMessages() {

        this.webSocketService.listenToMessages((message) => {
            // Handle incoming message
            console.log("hsjdjsdf", message);
            this.handleIncomingMessage(message);
            // this.updateMessageStatusInChat()
        });
        this.webSocketService.socket.on('message-seen', (data) => {
            console.log("data ", data);

            // Update the UI to show that messages sent to userId have been seen
            this.updateMessagesAsSeen()
        });
        this.webSocketService.listenToMessageStatusUpdates((update) => {
            // Update message status in the DataStore
            this.store.updateMessageStatus(update.messageId, update.status);
            // Reflect that change in the chat UI
            this.updateMessageStatusInChat(update.messageId, update.status);
        });
    }

    updateMessagesAsSeen(id) {
        console.log("updateALlMessage as seen");
        let components = this.component.querySelectorAll(".chat-message-status")

        components.forEach((el) => {
            el.innerHTML = "✓✓✓"
        })

    }

    // Handle incoming messages
    handleIncomingMessage(message) {
        // Add the incoming message to the store
        this.store.addMessage(message.from, {
            text: message.content,
            sender: message.from,
            timestamp: message.timestamp || new Date().toISOString(),
        });

        this.webSocketService.socket.emit('message-delivered', { messageId: message._id });
        const activeFriend = this.store.getActiveFriend();
        message.isDelivered = true;
        if (activeFriend && activeFriend._id === message.from) {
            // If the sender is the currently active friend, add the message to the active friend's messages
            message.isSeen = true;
            const chatMessagesContainer = this.component.querySelector(".chat-messages");
            console.log("dsjds ", message);
            this.appendMessageToChat(chatMessagesContainer, {
                _id: message._id,
                text: message.content,
                sender: message.from,
                timestamp: message.timestamp || new Date().toISOString(),
                isDelivered: message.isDelivered,
                isSeen: message.isSeen
            });
            const user = this.store.getUser();
            // this.store.updateFriendLastMessage(user._id, message);
            this.updateMessageStatusInChat(activeFriend._id, message);
            // api call at mark as seen
            const options = {
                method: 'POST',             // HTTP method
                headers: {
                    'Content-Type': 'application/json' // Specify content type as JSON
                },
            };
            let isSuccessful = false;
            fetch("/chat/markAsSeen/" + user._id + "/" + activeFriend._id, options).then(response => {
                if (response.status === 200) {
                    isSuccessful = true;
                    return response.json();
                } else {
                    throw new Error('Not a 200 response');
                }
            }).then(data => {
                console.log(data);
            }).catch(error => {
                console.error("There was an error with the fetch request:", error.message);
            })
            console.log("response api ", isSuccessful);
        } else {
            // If the sender is not the currently active friend, show a notification
            let senderName = this.store.getUserNameById(message.from);
            if (!senderName) {
                senderName = message.from;
            }

            // Show the in-page notification
            this.notification.showNotification(`New message from ${senderName}: ${message.content}`);

            // Show the browser notification
            this.notification.pushBrowserNotification({
                content: `${message.content}`,
                title: `${senderName}`,
                tag: 'new-message',
                logo: 'path/to/logo.png' // replace with the actual path
            });

            // Optionally, after a few seconds, you can hide the notification
            setTimeout(() => {
                this.notification.hideNotification();
            }, 5000); // Hide after 5 seconds
        }

        // Update the last message in the DataStore and reflect the change in the friend list UI
        this.store.updateFriendLastMessage(message.from, message.content);
        // Update the last message displayed in the friends list for the given friend ID
        this.updateFriendListLastMessageDisplay(message.from, message.content);
        this.webSocketService.socket.on('chat-opened', (otherUserId) => {
            this.webSocketService.socket.emit('mark-messages-as-seen', { userId: this.store.getUser()._id, otherUserId });
        });
    }

    updateFriendListLastMessageDisplay(friendId, messageContent) {
        const friendListItem = document.querySelector(`.friend-list-item[data-friend-id="${friendId}"] .friend-last-message`);
        if (friendListItem) {
            friendListItem.textContent = messageContent;
        }
    }

    // Send a message using the WebSocket

    async sendMessage(message, file = null) {
        console.log("Sending message:", message);

        if (this.store.getActiveFriend()) {
            // Get the active friend's ID
            const activeFriend = this.store.getActiveFriend();
            if (!activeFriend) {
                console.error("Active friend is not set yet.");
                return;
            }
            const activeFriendId = this.store.getActiveFriend()._id;
            const userId = this.store.getUser()._id;

            // Send the message and/or file to the server
            let res;
            if (file) {
                res = await this.chatService.uploadFile(userId, activeFriendId, file);
            } else {
                res = await this.chatService.sendMessage(userId, activeFriendId, message);
            }

            // console.log(res);

            // Create a message object to add to the store and append to the chat messages container
            const messageObj = {
                _id: res._id,
                sender: 'user',
                timestamp: new Date().toISOString(),
            };

            if (file) {
                messageObj.file = {
                    url: `/chat/download/${res._id}`,  // Use the file ID returned from the server
                    name: file.name,
                    size: file.size,
                    type: file.type
                };
            } else {
                messageObj.text = message;
            }

            // Update the store with the sent message
            this.store.addMessage(activeFriendId, messageObj);

            // Append the sent message to the chat messages container
            const chatMessagesContainer = this.component.querySelector(".chat-messages");
            if (chatMessagesContainer) {
                this.appendMessageToChat(chatMessagesContainer, messageObj);
                //////////////////
            }

            // Update the last message for the active friend
            this.store.updateFriendLastMessage(activeFriendId, file ? 'File sent' : message);
            this.updateFriendListLastMessageDisplay(activeFriendId, file ? 'File sent' : message);

            // Clear the currentMessage and file input
            this.currentMessage = '';
            const fileInput = this.component.querySelector(".file-input");
            if (fileInput) {
                fileInput.value = '';
            }

            // Clear the input field
            const messageInput = this.component.querySelector(".message-input");
            messageInput.value = '';
        }
    }

    // Function to append message
    appendMessageToChat(chatMessagesContainer, message) {
        const messageElement = document.createElement("div");
        const botTextBubble = document.createElement('div');
        botTextBubble.classList.add('bot-message', 'chat-message');
        botTextBubble.textContent ="Hi, How are you today?";

        if (message.file && message.file.url) {
            const fileLink = document.createElement("a");
            // fileLink.href = message.file.url;  // Set the download URL
            // console.log("url ka aya hai babbua ", message.file.url);
            fileLink.href = `/chat${message.file.url}`;  // Set the download URL
            fileLink.textContent = "Download File: " + message.file.name; // Display the file name
            fileLink.target = "_blank"; // To open the file in a new tab/window
            messageElement.appendChild(fileLink);
        } else {
            messageElement.textContent = message.text;
        }
        messageElement.classList.add("chat-message");

        // Add a unique data-message-id attribute to the message element for future reference
        messageElement.setAttribute('data-message-id', message._id);

        if (message.sender === 'user') {
            messageElement.classList.add("user-message");
        } else {
            messageElement.classList.add("friend-message");
        }

        const timestampSpan = document.createElement("span");
        timestampSpan.textContent = this.formatTimestamp(message.timestamp);
        timestampSpan.classList.add("chat-message-timestamp");

        const statusSpan = document.createElement("span");

        if (message.isSeen) {
            statusSpan.textContent = "\u2713\u2713\u2713"; // Triple tick symbol
        } else if (message.isDelivered) {
            statusSpan.textContent = "\u2713\u2713"; // Double tick symbol
        } else {
            statusSpan.textContent = "\u2713"; // Single tick symbol
        }
        statusSpan.classList.add("chat-message-status");

        messageElement.appendChild(timestampSpan);
        messageElement.appendChild(statusSpan);

        chatMessagesContainer.appendChild(messageElement);
        setTimeout(function(){
            // const timestampSpanBot = document.createElement("span");
            // timestampSpanBot.textContent = this.formatTimestamp(message.timestamp);
            // timestampSpanBot.classList.add("chat-message-timestamp");

            // botTextBubble.appendChild(timestampSpanBot);
            // botTextBubble.appendChild(timestampSpanBot);


            chatMessagesContainer.appendChild(botTextBubble);
        }, 1000);
        // this.scrollToBottom();
    }

    updateMessageStatusInChat(messageId, status) {
        // console.log("Update status:", messageId, status);
        const chatMessagesContainer = this.component.querySelector(".chat-messages");
        if (chatMessagesContainer) {
            const messageElement = chatMessagesContainer.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                const statusSpan = messageElement.querySelector(".chat-message-status");
                if (statusSpan) {
                    // Update the tick symbol based on the received status
                    if (status.isSeen == true) {
                        statusSpan.textContent = "\u2713\u2713\u2713"; // Triple tick symbol
                    } else if (status.isDelivered) {
                        statusSpan.textContent = "\u2713\u2713"; // Double tick symbol
                    } else {
                        statusSpan.textContent = "\u2713"; // Single tick symbol
                    }
                }
            }
        }
    }

    // Don't forget to disconnect the WebSocket when the chat is closed or the page is unloaded
    disconnectWebSocket() {
        this.webSocketService.disconnect();
    }

    formatTimestamp(timestamp) {
        // console.log("Raw timestamp:", timestamp);

        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12; // Convert 0 to 12 for AM
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    }

    markMe


}

export default ChatController;
