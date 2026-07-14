const express = require('express');
const bcrypt = require('bcryptjs');
const Projet = require('../models/Projet');
const upload = require("../middleware/uploadCloudinary");
const cloudinary = require('../utils/cloudinary');
const { requireAuth } = require('../middleware/auth');
const contactController = require('../controllers/controllerContact');

const router = express.Router();

const stack = [
    { titre: 'Frontend', skills: ['HTML5', 'CSS3', 'JavaScript', 'Vue.js'] },
    { titre: 'Backend', skills: ['Node.js', 'Express.js', 'Django (Python)', 'SQL', 'C# / .NET', 'Entity Framework', 'PHP'] },
    { titre: 'Base de données', skills: ['MongoDB', 'SQL Server', 'MySQL'] },
    { titre: 'Outils', skills: ['Git', 'GitHub', 'VS Code', 'AWS', 'MongoDB Compass', 'Android Studio'] },
    { titre: 'Autres', skills: ['SCRUM / Agile (notions)'] }
];

function informationsImageCloudinary(file) {
    if (!file) return { url: null, publicId: null };

    const resultat = file.path && typeof file.path === 'object' ? file.path : file;
    const chemin = typeof file.path === 'string' && file.path !== '[object Object]'
        ? file.path
        : null;
    const url = chemin || resultat.secure_url || resultat.url || file.secure_url || file.url || null;
    const publicId = file.filename || resultat.public_id || file.public_id || null;

    return { url, publicId };
}

async function supprimerImageCloudinary(publicId) {
    if (publicId) await cloudinary.uploader.destroy(publicId);
}

function messageErreurUpload(error) {
    if (typeof error === 'string') return error;
    if (error && typeof error.message === 'string') return error.message;
    if (error && error.error && typeof error.error.message === 'string') return error.error.message;

    try {
        return JSON.stringify(error);
    } catch {
        return 'Erreur Cloudinary inconnue.';
    }
}

function uploadImage(req, res, next) {
    upload.single('image')(req, res, (error) => {
        if (!error) return next();

        const message = messageErreurUpload(error);
        console.error('Erreur upload Cloudinary :', error);
        return res.status(400).send('Erreur lors de l upload de l image : ' + message);
    });
}

router.get('/', async (req, res) => 
    res.render('index'));

router.get('/projet', async (req, res) => {
    try {
        const projets = await Projet.find().sort({ createdAt: -1 });
        return res.render('projet', { projets });
    } catch (error) {
        console.error('Erreur chargement des projets :', error);
        return res.status(500).send('Impossible de charger les projets.');
    }
});

router.get('/apropos', (req, res) => res.render('apropos', { stack }));

router.get('/contact', (req, res) => {
    res.render('contact', { succes: null, erreur: null, valeurs: {} });
});

router.post('/contact', contactController.envoyerMessage);

router.get('/admin/login', (req, res) => res.render('login'));

router.post('/admin/login', async (req, res) => {
    try {
        const motDePasseValide = await bcrypt.compare(
            req.body.motDePasse || '',
            process.env.ADMIN_PASSWORD_HASH || ''
        );

        if (motDePasseValide) {
            req.session.estAdmin = true;
            return res.redirect('/admin');
        }

        return res.status(401).render('login', { erreur: 'Mot de passe incorrect.' });
    } catch (error) {
        console.error('Erreur de connexion administrateur :', error);
        return res.status(500).render('login', { erreur: 'Connexion temporairement indisponible.' });
    }
});

router.get('/admin/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/admin/login'));
});

router.get('/admin', requireAuth, async (req, res) => {
    try {
        const projets = await Projet.find().sort({ createdAt: -1 });
        return res.render('admin', { projets });
    } catch (error) {
        console.error('Erreur chargement administration :', error);
        return res.status(500).send('Impossible de charger administration.');
    }
});

router.post("/admin/projets", requireAuth, uploadImage, async (req, res) => {
        try {
            const imageCloudinary = informationsImageCloudinary(req.file);
            if (req.file && !imageCloudinary.url) {
                throw new Error('URL Cloudinary absente de la réponse upload.');
            }

            const {
                titre,
                technologie,
                description,
                lienCode,
                lienDemo
            } = req.body;

            const nouveauProjet = new Projet({
                titre,
                technologie,
                description,
                lienCode,
                lienDemo,

                image: imageCloudinary.url,
                imagePublicId: imageCloudinary.publicId
            });

            await nouveauProjet.save();

            return res.redirect("/admin");

        } catch (error) {
            console.error("Erreur ajout projet :", error);

            const imageCloudinary = informationsImageCloudinary(req.file);
            await supprimerImageCloudinary(imageCloudinary.publicId).catch(() => {});

            return res.status(500).send(
                "Impossible d’ajouter le projet."
            );
        }
    }
);

router.post('/admin/projets/:id/modifier', requireAuth, uploadImage, async (req, res) => {
    try {
        const nouvelleImage = informationsImageCloudinary(req.file);
        if (req.file && !nouvelleImage.url) {
            throw new Error('URL Cloudinary absente de la réponse upload.');
        }

        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            await supprimerImageCloudinary(nouvelleImage.publicId);
            return res.status(404).send('Projet introuvable.');
        }

        const ancienPublicId = projet.imagePublicId;
        projet.titre = req.body.titre;
        projet.description = req.body.description;
        projet.technologie = req.body.technologie;
        projet.lienCode = req.body.lienCode;
        projet.lienDemo = req.body.lienDemo;
        if (req.file) {
            projet.image = nouvelleImage.url;
            projet.imagePublicId = nouvelleImage.publicId;
        }

        await projet.save();
        if (req.file && ancienPublicId) {
            await supprimerImageCloudinary(ancienPublicId).catch((error) => {
                console.error('Erreur suppression ancienne image Cloudinary :', error);
            });
        }
        return res.redirect('/admin');
    } catch (error) {
        console.error('Erreur modification projet :', error);
        const nouvelleImage = informationsImageCloudinary(req.file);
        await supprimerImageCloudinary(nouvelleImage.publicId).catch(() => {});
        return res.status(500).send('Impossible de modifier le projet.');
    }
});

router.post(
    "/admin/projets/:id/supprimer",
    requireAuth,
    async (req, res) => {
        try {
            const projet = await Projet.findById(req.params.id);

            if (!projet) {
                return res.status(404).send("Projet introuvable.");
            }

            await supprimerImageCloudinary(projet.imagePublicId);

            await projet.deleteOne();

            return res.redirect("/admin");

        } catch (error) {
            console.error("Erreur suppression projet :", error);

            return res.status(500).send(
                "Impossible de supprimer le projet."
            );
        }
    }
);

module.exports = router;
