const nodemailer = require("nodemailer");

function afficherContact(res, statut, donnees) {
    return res.status(statut).render("contact", donnees);
}

exports.envoyerMessage = async (req, res) => {
    const valeurs = {
        nom: (req.body.nom || "").trim(),
        email: (req.body.email || "").trim(),
        objet: (req.body.objet || "").trim(),
        message: (req.body.message || "").trim()
    };

    if (Object.values(valeurs).some((valeur) => !valeur)) {
        return afficherContact(res, 400, {
            succes: null,
            erreur: "Veuillez remplir tous les champs.",
            valeurs
        });
    }

    if (!/^\S+@\S+\.\S+$/.test(valeurs.email)) {
        return afficherContact(res, 400, {
            succes: null,
            erreur: "Veuillez saisir une adresse courriel valide.",
            valeurs
        });
    }

    const variablesRequises = [
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USER",
        "SMTP_PASS",
        "BREVO_SENDER_EMAIL",
        "CONTACT_EMAIL"
    ];

    if (variablesRequises.some((nom) => !process.env[nom])) {
        console.error("Configuration SMTP incomplète.");

        return afficherContact(res, 503, {
            succes: null,
            erreur: "Le formulaire est temporairement indisponible.",
            valeurs
        });
    }

    const port = Number(process.env.SMTP_PORT);

    const transporteur = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        const info = await transporteur.sendMail({
            from: `"Portfolio Abdoul David" <${process.env.BREVO_SENDER_EMAIL}>`,
            to: process.env.CONTACT_EMAIL,
            replyTo: valeurs.email,
            subject: `[Portfolio] ${valeurs.objet}`,
            text: [
                `Nom : ${valeurs.nom}`,
                `Courriel : ${valeurs.email}`,
                "",
                valeurs.message
            ].join("\n")
        });

        console.log("Message ID :", info.messageId);
        console.log("Acceptés :", info.accepted);
        console.log("Rejetés :", info.rejected);
        console.log("Réponse SMTP :", info.response);

        if (!info.accepted?.includes(process.env.CONTACT_EMAIL)) {
            throw new Error("L’adresse destinataire n’a pas été acceptée par le serveur SMTP.");
        }

        return afficherContact(res, 200, {
            succes: "Votre message a bien été envoyé.",
            erreur: null,
            valeurs: {}
        });

    } catch (error) {
        console.error("Erreur lors de l'envoi du message :", error);

        return afficherContact(res, 500, {
            succes: null,
            erreur: "Le message n'a pas pu être envoyé. Veuillez réessayer plus tard.",
            valeurs
        });
    }
};