class HomeController {
  constructor() {
    // Initialize any properties or state needed for the home page
    this.homeContainer = this.renderHome();
  }

  renderHome() {
    // Create a container element for the home page content
    const container = document.createElement("div");
    container.classList.add("home-container"); // You can add CSS classes for styling

    // Create and add content to the home page
    //The heading and description
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

    // Append the elements to the container
    container.appendChild(headerAndParaContainer);
    container.appendChild(imagesContainer);
    container.appendChild(section);

    return container; // Return the container as a Node
  }

  getHomeContainer() {
    return this.homeContainer;
  }
}

export default HomeController;
