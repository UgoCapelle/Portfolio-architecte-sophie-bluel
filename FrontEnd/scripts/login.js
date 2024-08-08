// Écouteur d'événements qui se déclenche lorsque le DOM est complètement chargé.
document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("#login form");
    const errorMessage = document.querySelector("#error-message");

    // Écouteur d'événements pour la soumission du formulaire de connexion.
    form.addEventListener("submit", async function(event) {
        event.preventDefault(); // Empêche le comportement par défaut du formulaire.

        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;

        try {
            // Envoi des informations de connexion au backend.
            const response = await fetch("http://localhost:5678/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const responseData = await response.json();

            if (response.ok) {
                // Stocke le token et redirige vers la page d'accueil.
                localStorage.setItem("token", responseData.token);
                localStorage.setItem("tokenSetTime", new Date().toISOString());
                window.location.href = "index.html?login=true";
            } else {
                // Affiche un message d'erreur en fonction du code de statut de la réponse.
                errorMessage.textContent = getErrorMessage(response.status);
            }
        } catch (error) {
            console.error("Erreur:", error);
            errorMessage.textContent = "Une erreur s'est produite. Veuillez réessayer plus tard.";
        }
    });

    // Fonction pour obtenir un message d'erreur en fonction du code de statut.
    function getErrorMessage(status) {
        switch (status) {
            case 401:
                return "Informations d'utilisateur / mot de passe incorrectes.";
            case 404:
                return "Utilisateur non trouvé.";
            default:
                return "Une erreur s'est produite. Veuillez réessayer plus tard.";
        }
    }
});
