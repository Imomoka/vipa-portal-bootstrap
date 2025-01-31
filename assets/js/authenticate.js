
document.addEventListener("DOMContentLoaded", () => {
    //Login content
    //show password Toggle
   //declare show password toggle
   const showPasswordToggle = document.getElementById('showPassword');
   //declare password field
   const passwordField = document.getElementById('password_Field');   
   //add event change on showPassword Toggle
   if(showPasswordToggle){
       showPasswordToggle.addEventListener('change',changePasswordinputType);
       //check toggle state
        changePasswordinputType();
   }else{
    //do nothing
   }
   //check showPassword Toggle state
    function changePasswordinputType(){
        //passwordToggle = document.getElementById('showPassword');
        //const passwordField = document.getElementById('password_Field');
        if(showPasswordToggle.checked){
            passwordField.type='text';
        }
        else{
            passwordField.type = 'password';
        }
    }

    //declare login button
    const loginButton = document.getElementById('loginButton');
    if(loginButton){
        loginButton.addEventListener('click',authorizeUser);
    }else{}
    //login Button Clicked

});
    
    
const API_BASE_URL = "https://api1.simplyworkcrm.com/api:C7JSXBeF/auth";

/**
* Logs in the user and stores the access token.
*/
async function authorizeUser() {
    const userEmail = document.getElementById('email_Field').value;
    const userPassword = document.getElementById('password_Field').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: userEmail, password: userPassword }),
            credentials: "include" // Ensures cookies are sent/received
        });

        if (!response.ok) {
            throw new Error(`Login failed: ${response.status}`);
        }

        const data = await response.json();
        console.log("Login successful:", data);

        // Store the access token
        localStorage.setItem("access_token", data.access_token);

        // Redirect the user after login
        window.location.href = "/empty";
        
    } catch (error) {
        console.error("Error during login:", error);
        alert("Login failed. Please try again.");
    }
}