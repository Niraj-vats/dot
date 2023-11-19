// Import the AuthService class
import AuthService from '../../services/AuthService.js';

class LoginController {
    constructor() {
        this.username = "";
        this.password = "";
        this.isLoggedIn = false;
        this.formContainer = this.renderLoginForm();
        // Create an instance of AuthService
        this.authService = new AuthService();
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this[name] = value;
    }

    async handleLoginSubmit(event) {
        event.preventDefault();

        // Use the authService instance to handle the login process
        const loginData = {
            username: this.username,
            password: this.password,
        };

        try {
            const response = await this.authService.login(loginData);
            // Check if the login was successful based on the response (adjust as needed)
            if (response.token) {
                this.isLoggedIn = true;
                document.cookie = `token=${response.token}; path=/`;
                window.location.href = "/friends"; // Redirect to the home page
                return
            } else {
                this.isLoggedIn = false;
                // Handle login failure (display error message, etc.)
                console.error("Login failed.");
            }
        } catch (error) {
            console.error("An error occurred during login:", error);
        }

        // Re-render the form after login attempt
        this.formContainer.innerHTML = "";
        this.formContainer.appendChild(this.renderLoginForm());
    }

    renderLoginForm() {
        const { username, password, isLoggedIn } = this;
    
        if (isLoggedIn) {
            return document.createDocumentFragment(); // Render nothing if logged in
        }
    
        const formContainer = document.createElement("div");
        formContainer.classList.add("login-container");  // Adding class for centering

        const imgContainer = document.createElement("div");
        imgContainer.classList.add('imgContainer');


        //The heading and description on the left
        const headingAndDescription = document.createElement('div');
        headingAndDescription.classList.add('headingAndDescription');

        const heading = document.createElement('h2');
        heading.textContent = "Welcome Back !";

        const desription = document.createElement('p');
        desription.textContent = "Engage, share and connect with your friends";

        headingAndDescription.appendChild(heading);
        headingAndDescription.appendChild(desription);


        //The form on the right
        const formTitle = document.createElement("h2");
        formTitle.textContent = "Login";
    
        const form = document.createElement("form");
        form.classList.add("login-form");  // Adding class for styling
        form.addEventListener("submit", this.handleLoginSubmit.bind(this));

        form.appendChild(headingAndDescription);
    
        const fields = [
            { label: "Username:", type: "text", name: "username", value: username , placeholder:"Username"},
            { label: "Password:", type: "password", name: "password", value: password, placeholder:"Password" },
        ];
    
        fields.forEach(({ label, type, name, value, placeholder }) => {
            const labelElement = document.createElement("label");
            labelElement.textContent = label;
    
            const inputElement = document.createElement("input");
            inputElement.type = type;
            inputElement.name = name;
            inputElement.value = value;
            inputElement.placeholder = placeholder;
            inputElement.required = true;  // Making fields required
    
            if (name === "username") {
                // inputElement.pattern = "^[a-zA-Z0-9]+$";
                inputElement.title = "Username can only contain alphanumeric characters";
            }
    
            inputElement.addEventListener("input", this.handleInputChange.bind(this));
    
            // form.appendChild(labelElement);
            form.appendChild(inputElement);
        });
    
        const loginButton = document.createElement("button");
        loginButton.type = "submit";
        loginButton.textContent = "Login";

        const forgotPass = document.createElement("a");
        forgotPass.classList.add('forgotPass');
        forgotPass.setAttribute('href','/signup');
        forgotPass.textContent = "Forgot password?";

        const SignUpButton = document.createElement("button");
        SignUpButton.type = "submit";
        SignUpButton.textContent = "Create new account";
    
        form.appendChild(loginButton);
        form.appendChild(forgotPass);
        form.appendChild(SignUpButton);

        // formContainer.appendChild(headingAndDescription);
        // formContainer.appendChild(formTitle);
        formContainer.appendChild(imgContainer);
        formContainer.appendChild(form);
    
        return formContainer;
    }

    getFormContainer() {
        return this.formContainer;
    }
}

export default LoginController;
