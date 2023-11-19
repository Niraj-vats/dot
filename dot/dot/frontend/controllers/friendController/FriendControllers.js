// FriendController.js
import FriendService from '../../services/FriendServices.js';

class FriendController {
    constructor(store) {
        this.store = store;
        this.controllerId = "friend-controller";
        this.component = this.createFriendsPlaceholder(); // Create a placeholder for the component during construction
    }

    addChatController(controller) {
        this.chatController = controller;
    }

    // Initialize the controller (call this when the page loads)
    async init() {
        await this.loadFriends(); // Load friends from the server or mock data
        // Append the friend list to the placeholder
        this.appendFriendsToComponent();
    }

    // Load friends from the service
    async loadFriends() {
        try {
            const friendService = new FriendService();
            const friends = await friendService.getFriends();

            this.store.setFriends(friends)
        } catch (error) {
            console.error("FriendController - Load Friends error:", error);
        }
    }

    // Method to set a friend as active
    setActiveFriend(friend) {
        this.store.setActiveFriend(friend);
        this.chatController.renderChat();
    }

    // Method to render the active friend's information and messages in the UI
    renderActiveFriend() {
        // Implement this method to update the UI with the active friend's details
        if (this.activeFriend) {
            // Create the chat UI for the active friend
            const chatUI = this.chatController.createChatUI();

            // Find the chat container and replace its content with the chat UI
            const chatContainer = document.querySelector(".chat-ui-container");
            if (chatContainer) {
                chatContainer.innerHTML = ""; // Clear existing content
                chatContainer.appendChild(chatUI); // Append the chat UI
            }
        } else {
            // No active friend is set, you can handle this case if needed
        }
    }

    // Method to create a placeholder for the friends component
    createFriendsPlaceholder() {
        // Create a div with the friend-controller ID
        const friendControllerDiv = document.createElement("div");
        friendControllerDiv.id = this.controllerId;

        return friendControllerDiv;
    }

    // Method to append the friends list to the component
    appendFriendsToComponent() {
        if (this.component) {
            // Create a friends list container
            const friendsListContainer = this.createFriendsComponent();
            const spaceListContainer = this.createSpaceContainer();
            const bottomOptionContainer = this.createBottomOptionContainer();
            this.component.appendChild(friendsListContainer);
            this.component.appendChild(spaceListContainer);
            this.component.appendChild(bottomOptionContainer);
        }
    }

    // Method to create the friends component
    // createFriendsComponent() {
    //     const friendsListContainer = document.createElement("div");
    //     friendsListContainer.classList.add("friends-list");
    //     const friends = this.store.getFriends()

    //     // Loop through the friends and create a list item for each
    //     friends.forEach((friend) => {
    //         const friendListItem = document.createElement("div");
    //         friendListItem.classList.add("friend-list-item");

    //         // Create a circular status dot based on the friend's status
    //         const statusDot = document.createElement("div");
    //         statusDot.classList.add("status-dot", friend.status === "active" ? "active-status" : "inactive-status");

    //         // Create a profile picture element for the friend
    //         const profilePic = document.createElement("img");
    //         profilePic.src = friend.profilePic;
    //         profilePic.alt = friend.name;
    //         profilePic.classList.add("profile-pic");

    //         const nameElement = document.createElement("span");
    //         nameElement.textContent = friend.name;
    //         nameElement.classList.add("friend-name");
    //         friendListItem.appendChild(nameElement); // First append the name

    //         // Create a last message element for the friend
    //         const lastMessageElement = document.createElement("span");
    //         lastMessageElement.textContent = friend.lastMessage;
    //         lastMessageElement.classList.add("friend-last-message");
    //         friendListItem.appendChild(lastMessageElement); // Then append the last message right below the name

    //         // Add a click event listener to set the friend as active when clicked
    //         friendListItem.addEventListener("click", () => {
    //             console.log(friend);
    //             this.setActiveFriend(friend);
    //         });

    //         // Append the status dot, profile picture, name, and last message to the list item
    //         friendListItem.appendChild(statusDot);
    //         friendListItem.appendChild(profilePic);
    //         friendListItem.appendChild(nameElement);
    //         friendListItem.appendChild(lastMessageElement);

    //         friendListItem.addEventListener("click", () => {
    //             this.setActiveFriend(friend); // Trigger setActiveFriend when a friend is clicked
    //             this.chatController.toggleChatDisplay();
    //         });

    //         // Append the list item to the friends list container
    //         friendsListContainer.appendChild(friendListItem);
    //     });

    //     // Return the friends list container
    //     return friendsListContainer;
    // }
    createFriendsComponent() {
        const friendsListContainer = document.createElement("div");
        friendsListContainer.classList.add("friends-list");

        const searchContainer = document.createElement('div');
        searchContainer.classList.add('search-container');
        const searchIcon = document.createElement('i');
        searchIcon.classList.add('fa-solid','fa-magnifying-glass');

        const searchBox = document.createElement('input');
        searchBox.type ="text";
        searchBox.placeholder ="Search in chat";
        // searchBox.style.border ="none";
        // searchBox.style.borderBottom ="1px solid #333";

        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchBox);

        friendsListContainer.appendChild(searchContainer);

        const chatHeaderContainer = document.createElement("div");
        chatHeaderContainer.classList.add('chat-header-container');

        const smallTextChat = document.createElement("p");
        smallTextChat.textContent= "Chats"; 

        const caretDownAndText = document.createElement("span");
        
        const chatText = document.createElement('p');
        chatText.textContent = "Chats";

        const caretDown = document.createElement('i');
        caretDown.classList.add('fa-solid', 'fa-caret-down');

        caretDownAndText.appendChild(caretDown);
        caretDownAndText.appendChild(chatText);

        const plusSignChatHeader = document.createElement('i');
        plusSignChatHeader.classList.add('fa-solid', 'fa-plus');

        chatHeaderContainer.appendChild(caretDownAndText);
        chatHeaderContainer.appendChild(plusSignChatHeader);


        friendsListContainer.appendChild(smallTextChat);
        friendsListContainer.appendChild(chatHeaderContainer);


        const friends = this.store.getFriends(); //get name of friends

        friends.forEach((friend) => {
            const friendListItem = document.createElement("div");
            friendListItem.classList.add("friend-list-item");
            friendListItem.setAttribute("data-friend-id", friend._id);

            // Create a circular status dot
            // const statusDot = document.createElement("div");
            // statusDot.classList.add("status-dot", friend.status === "active" ? "active-status" : "inactive-status");
            // friendListItem.appendChild(statusDot);

            // Create a profile picture
            //Change here******
            const profilePic = document.createElement("img");
            // profilePic.src = friend.profilePic;
            profilePic.src = `../../styles/Images/${friend.name}.jpg`;
            profilePic.alt = friend.name;
            profilePic.classList.add("profile-pic"); // style profile pic
            friendListItem.appendChild(profilePic);
            //Change here******

            // Create a container for name and last message
            const nameAndMessageContainer = document.createElement("div");
            nameAndMessageContainer.classList.add("name-message-container");
            friendListItem.appendChild(nameAndMessageContainer);

            // Add friend's name
            const nameElement = document.createElement("span");
            nameElement.textContent = friend.name; // This is friend name
            nameElement.classList.add("friend-name");
            nameAndMessageContainer.appendChild(nameElement);

            // Add last message
            const lastMessageElement = document.createElement("span");
            lastMessageElement.textContent = friend.lastMessage || "";
            lastMessageElement.classList.add("friend-last-message");
            nameAndMessageContainer.appendChild(lastMessageElement);


            // Event listener for setting active friend
            friendListItem.addEventListener("click", () => {
                this.setActiveFriend(friend);
                this.chatController.loadStoredMessages();
                this.chatController.toggleChatDisplay();
            });

            friendsListContainer.appendChild(friendListItem);
        });

        return friendsListContainer;
    }

    createSpaceContainer() {
        const spaceListContainer = document.createElement("div");
        spaceListContainer.classList.add("space-list");

        const searchContainer = document.createElement('div');
        searchContainer.classList.add('search-container');
        const searchIcon = document.createElement('i');
        searchIcon.classList.add('fa-solid','fa-magnifying-glass');

        const searchBox = document.createElement('input');
        searchBox.type ="text";
        searchBox.placeholder ="Search in chat";

        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchBox);
        
        spaceListContainer.appendChild(searchContainer);

        const smallTextSpace = document.createElement("p");
        smallTextSpace.textContent= "Spaces";

        const spaceHeaderContainer = document.createElement("div");
        spaceHeaderContainer.classList.add('space-header-container');

        const caretDownAndTextSpace = document.createElement("span");
        
        const spaceText = document.createElement('p');
        spaceText.textContent = "Spaces";

        const caretDownSpace = document.createElement('i');
        caretDownSpace.classList.add('fa-solid', 'fa-caret-down');

        caretDownAndTextSpace.appendChild(caretDownSpace);
        caretDownAndTextSpace.appendChild(spaceText);

        const plusSignSpaceHeader = document.createElement('i');
        plusSignSpaceHeader.classList.add('fa-solid', 'fa-plus');

        spaceHeaderContainer.appendChild(caretDownAndTextSpace);
        spaceHeaderContainer.appendChild(plusSignSpaceHeader);

        spaceListContainer.appendChild(smallTextSpace);
        spaceListContainer.appendChild(spaceHeaderContainer);

        const spaceList = ['Friends Space', 'Study Space', 'Work Space'];

        spaceList.forEach((space, index) => {
            const spaceListItem = document.createElement("div");
            spaceListItem.classList.add("space-list-item");
            spaceListItem.setAttribute("id", `${index}`);

            var spaceFirstLetter = document.createElement('span');
            spaceFirstLetter.textContent = `${space[0]}`;

            var spaceName = document.createElement('span');
            spaceName.textContent = `${space}`;
            spaceName.style.color = 'black';
            spaceName.style.fontWeight = '400';
            spaceName.style.fontSize = '1.2rem';

            spaceListItem.appendChild(spaceFirstLetter);
            spaceListItem.appendChild(spaceName);

            spaceListContainer.appendChild(spaceListItem);

        });
        
        return spaceListContainer;
    }

    createBottomOptionContainer(){
        const footer = document.createElement('div'); 
        footer.classList.add('footer');

        var footerData = document.createElement('div');
        footerData.classList.add('footer_data');

        var footBtn1 = document.createElement('div');
        footBtn1.classList.add('foot_btn');
        footBtn1.setAttribute('id','chatBtn');
        var msgIcon = document.createElement('i');
        msgIcon.classList.add('fa-regular','fa-message');
        var msgIconName = document.createElement('span');
        msgIconName.textContent = "Chat";

        const mobandtab = window.matchMedia("(max-width: 768px)");
 

        footBtn1.addEventListener("click",function(){

            if(mobandtab.matches){
                document.querySelector(".space-list").style.display ="none";
                document.querySelector(".friends-list").style.display ="block";
            }else{
                document.querySelector(".space-list").style.display ="block";
            }
        })


        footBtn1.appendChild(msgIcon);
        footBtn1.appendChild(msgIconName);

        var footBtn2 = document.createElement('div');
        footBtn2.classList.add('foot_btn');
        footBtn2.setAttribute('id','spacesBtn');
        var pplIcon = document.createElement('i');
        pplIcon.classList.add('fa-solid','fa-people-group');
        var pplIconName = document.createElement('span');
        pplIconName.textContent = "Spaces";
        footBtn2.appendChild(pplIcon);
        footBtn2.appendChild(pplIconName);

        footBtn2.addEventListener("click",function(){

            if(mobandtab.matches){
                document.querySelector(".space-list").style.display ="block";
                document.querySelector(".space-list .search-container").style.display ="flex";
                document.querySelector(".friends-list").style.display ="none";
            }else{
                document.querySelector(".friends-list").style.display ="block";
            }
        })

        footerData.appendChild(footBtn1);
        footerData.appendChild(footBtn2);

        footer.appendChild(footerData);

        return footer;
    }

    // Method to get the friends container for rendering
    getFriendsContainer() {
        return this.component;
    }
}

export default FriendController;
