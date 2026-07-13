(function () {
    document.querySelectorAll('.body-editeur').forEach(function (editeur) {
        var contenu = editeur.querySelector('.contenant-editeur');
        var gouttiere = editeur.querySelector('.chiffre-editeur');
        if (!contenu || !gouttiere) return;

        var nombreLignes = contenu.querySelectorAll('.ligne-editeur').length;
        var html = '';
        for (var i = 1; i <= 25; i++) html += '<span>' + i + '</span>';
        gouttiere.innerHTML = html;
    });
})();
