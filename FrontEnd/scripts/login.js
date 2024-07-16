document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("#login form");
    const errorMessage = document.querySelector("#error-message");

    form.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;

        try {
            const response = await fetch("http://localhost:5678/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const responseData = await response.json();

            if (response.ok) {
                console.log("Token received:", responseData.token);
                localStorage.setItem("token", responseData.token);
                localStorage.setItem("tokenSetTime", new Date().toISOString());
                console.log("Token saved in localStorage:", localStorage.getItem("token"));
                window.location.href = "index.html?login=true";
            } else {
                switch (response.status) {
                    case 401:
                        errorMessage.textContent = "Informations d'utilisateur / mot de passe incorrectes.";
                        break;
                    case 404:
                        errorMessage.textContent = "Utilisateur non trouvé.";
                        break;
                    default:
                        errorMessage.textContent = "Une erreur s'est produite. Veuillez réessayer plus tard.";
                        break;
                }
            }
        } catch (error) {
            console.error("Erreur:", error);
            errorMessage.textContent = "Une erreur s'est produite. Veuillez réessayer plus tard.";
        }
    });
});
