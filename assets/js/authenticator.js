const API_BASE_URL = "https://api1.simplyworkcrm.com/api:C7JSXBeF/auth";


/**
 * Calls a protected API endpoint using the stored access token.
 * If the token is expired, it attempts to refresh it.
 */
async function fetchProtectedData() {
    let accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
        console.log("No access token, trying to refresh...");
        accessToken = await refreshAuth();
        if (!accessToken) {
            console.error("No valid access token available.");
            return;
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/me`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },
            credentials: "include"
        });

        if (response.status === 401) {
            console.warn("Access token expired, refreshing...");
            accessToken = await refreshAuth();

            if (!accessToken) {
                alert("Access Failed, please login again");
                window.location.href = "/sign-in";
            }

            // Retry the request with the new token
            return fetchProtectedData();
        }

        const data = await response.json();
        console.log("Protected data:", data);
    } catch (error) {
        console.error("Error fetching protected data:", error);
    }
}

async function refreshAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/refresh`, {
            method: "POST",
            credentials: "include" // Sends the HttpOnly cookie
        });
    
        if (!response.ok) {
            console.warn("Refresh token expired or invalid. Redirecting to login...");
            window.location.href = "/sign-in"; // Redirect to login if refresh fails
            return null;
        }
    
        const data = await response.json();
        console.log("Access token refreshed:", data);
    
        // Store new access token
        localStorage.setItem("access_token", data.access_token);
        return data.access_token;
        
    } catch (error) {
        console.error("Failed to refresh token:", error);
        return null;
    }
}