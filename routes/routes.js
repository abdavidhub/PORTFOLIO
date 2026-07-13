const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const bcrypt = require('bcryptjs');

const Projet = require('../models/Projet');
const upload = require('../utils/upload');
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

async function supprimerImageProjet(imageUrl) {
    const nomFichier = path.basename(imageUrl || '');
    if (!nomFichier) return;

    const cheminImage = path.join(__dirname, '..', 'public', 'images', 'projets', nomFichier);
    try {
        await fs.unlink(cheminImage);
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
}

router.get('/', (req, res) => res.render('index'));

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

router.post('/admin/projets', requireAuth, upload.single('image'), async (req, res) => {
    try {
        const nouveauProjet = new Projet({
            titre: req.body.titre,
            description: req.body.description,
            technologie: req.body.technologie,
            lienCode: req.body.lienCode,
            lienDemo: req.body.lienDemo,
            image: req.file ? '/images/projets/' + req.file.filename : null
        });
        await nouveauProjet.save();
        return res.redirect('/admin');
    } catch (error) {
        console.error('Erreur ajout projet :', error);
        return res.status(500).send('Impossible ajouter le projet.');
    }
});

router.post('/admin/projets/:id/modifier', requireAuth, upload.single('image'), async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            if (req.file) await supprimerImageProjet(req.file.filename);
            return res.status(404).send('Projet introuvable.');
        }

        const ancienneImage = projet.image;
        projet.titre = req.body.titre;
        projet.description = req.body.description;
        projet.technologie = req.body.technologie;
        projet.lienCode = req.body.lienCode;
        projet.lienDemo = req.body.lienDemo;
        if (req.file) projet.image = '/images/projets/' + req.file.filename;

        await projet.save();
        if (req.file && ancienneImage) await supprimerImageProjet(ancienneImage);
        return res.redirect('/admin');
    } catch (error) {
        console.error('Erreur modification projet :', error);
        return res.status(500).send('Impossible de modifier le projet.');
    }
});

router.post('/admin/projets/:id/supprimer', requireAuth, async (req, res) => {
    try {
        const projet = await Projet.findByIdAndDelete(req.params.id);
        if (!projet) return res.status(404).send('Projet introuvable.');

        if (projet.image) await supprimerImageProjet(projet.image);
        return res.redirect('/admin');
    } catch (error) {
        console.error('Erreur suppression projet :', error);
        return res.status(500).send('Impossible de supprimer le projet.');
    }
});

module.exports = router;
