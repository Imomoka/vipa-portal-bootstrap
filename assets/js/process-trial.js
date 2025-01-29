// declare elements and functions associated
document.addEventListener("DOMContentLoaded", () => {

    //declare show password toggle
    const showPasswordToggle = document.getElementById('showPassword');
    if(showPasswordToggle){
        showPasswordToggle.addEventListener('change',changePasswordinputType);
    }

    //declare login button
    const loginButton = document.getElementById('loginButton');
    if(loginButton){
        loginButton.addEventListener('click',authorizeUser);
    }

    //check if timer exist
    const storedTimer = localStorage.getItem("timeLeft");
    if (storedTimer) {
        persistentTimer(storedTimer);
    }


});

//check showPassword Toggle state
function changePasswordinputType(){
    const passwordToggle = document.getElementById('showPassword');
    const passwordField = document.getElementById('password_Field');
    if(passwordToggle.checked){
        passwordField.type='text';
    }
    else{
        passwordField.type = 'password';
    }
}

//login Button Clicked
function authorizeUser(){
    const userEmail = document.getElementById('email_Field').value;
    const userPassword = document.getElementById('password_Field').value;

    // Construct the API URL with the credentials
    const apiUrl = `https://api1.simplyworkcrm.com/api:C7JSXBeF/auth/login?email=${userEmail}&password=${userPassword}`;

    // Send the data using a GET request (if required by API)
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        console.log('Login successful:', data);
        alert('Login successful!');
        // Handle successful login response (e.g., redirect or save token)
        window.location.href = "file:///C:/Users/z/Desktop/GitImomoka/vipa-portal-bootstrap/pages/empty.html"; 
        localStorage.setItem("access_token",data.access_token);
        let initialTime = Math.floor(data.exp - data.iat);
        localStorage.setItem("timeLeft",initialTime);
        persistentTimer(initialTime);
    })
    .catch((error) => {
        console.error('Error during login:', error);
        alert('Login failed. Please try again.');
        
    });
}

function persistentTimer(timeLeft){
    if(timeLeft <=100000){
        alert("Looks like you've been offline. Please login again");
    }
    timeLeft -=1000;
    localStorage.setItem("timeLeft",timeLeft);
}

function authRefresh(expiration){

}

