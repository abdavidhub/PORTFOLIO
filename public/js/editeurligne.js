(function () {
    var editeurs = document.querySelectorAll('.body-editeur');

    function numeroterEditeur(editeur) {
        var contenu = editeur.querySelector('.contenant-editeur');
        var gouttiere = editeur.querySelector('.chiffre-editeur');
        if (!contenu || !gouttiere) return;

        var lignes = contenu.querySelectorAll('.ligne-editeur');
        gouttiere.innerHTML = '';
        var prochainNumero = 1;

        lignes.forEach(function (ligne) {
            var style = window.getComputedStyle(ligne);
            var hauteurLigne = parseFloat(style.lineHeight);
            var hauteurVisible = ligne.getBoundingClientRect().height;
            var nombreRangees = hauteurLigne > 0
                ? Math.max(1, Math.round(hauteurVisible / hauteurLigne))
                : 1;

            for (var rangee = 0; rangee < nombreRangees; rangee++) {
                var numero = document.createElement('span');
                numero.textContent = prochainNumero++;
                if (hauteurLigne > 0) numero.style.height = hauteurLigne + 'px';
                gouttiere.appendChild(numero);
            }
        });
    }

    function numeroterTousLesEditeurs() {
        editeurs.forEach(numeroterEditeur);
    }

    numeroterTousLesEditeurs();
    window.addEventListener('load', numeroterTousLesEditeurs);
    window.addEventListener('resize', numeroterTousLesEditeurs);
    document.addEventListener('shown.bs.tab', numeroterTousLesEditeurs);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(numeroterTousLesEditeurs);
    }
})();
