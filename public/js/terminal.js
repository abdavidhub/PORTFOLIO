(function () {
    var output = document.getElementById('terminal-output');
    var input = document.getElementById('terminal-input');
    var body = document.getElementById('terminal-body');
    if (!output || !input || !body) return;

    var history = [];
    var historyIndex = -1;

    var commands = {
        help: function () {
            return [
                'Commandes disponibles :',
                '  whoami     affiche qui je suis',
                '  apropos    mon parcours',
                '  projets    mes projets',
                '  stack      ma stack technique',
                '  contact    comment me joindre',
                '  clear      vide le terminal'
            ].join('\n');
        },
        whoami: function () {
            return [
                'Abdoul-David Diarrassouba',
                'Développeur web full-stack, ancien gestionnaire en restauration.',
                'Actuellement en recherche de stage pour l\'automne 2026.'
            ].join('\n');
        },
        apropos: function () {
            return [
                'AEC en Développement Web et Analyse de Données — Collège CDI Laval (fin 2026).',
                'Parcours atypique : gestion de restaurant et contrats de restauration militaire',
                'avant de passer au développement web.',
                '→ Plus de détails : /apropos'
            ].join('\n');
        },
        projets: function () {
            return [
                '1. MégaBoutique        gestion d\'inventaire — Node.js / Express / MongoDB',
                '2. Portfolio     ce site-ci — Node.js / EJS / Express / MongoDB',
                '3. Guichet automatique simulateur ATM — C# / WPF / SQL Server',
                '→ Plus de détails : /projets'
            ].join('\n');
        },
        stack: function () {
            return [
                'Frontend    HTML/CSS, JavaScript, Vue.js, Bootstrap, React(apprentissage en cours)',
                'Backend     Node.js, Express, PHP, Python, Java, C#/.NET',
                'Bases de données  SQL Server, MySQL, MongoDB',
                'Outils      Git, GitHub, CI/CD, AWS',
                'Méthodologies      Agile/SCRUM(notions)'
            ].join('\n');
        },
        contact: function () {
            return [
                'GitHub    github.com/abdavidhub',
                'LinkedIn  linkedin.com/in/abdoul-david-diarrassouba',
                '→ Formulaire : /contact'
            ].join('\n');
        },
        sudo: function () {
            return 'Belle tentative. Mais non.';
        },
        clear: 'CLEAR'
    };

    function printLine(text, className) {
        var line = document.createElement('div');
        line.className = 'terminal-line' + (className ? ' ' + className : '');
        line.textContent = text;
        output.appendChild(line);
    }

    function runCommand(raw) {
        var cmd = raw.trim().toLowerCase();
        printLine('D:/users/david$>' + raw, 'terminal-echo');

        if (cmd === '') return;

        if (cmd === 'clear') {
            output.innerHTML = '';
            return;
        }

        var handler = commands[cmd];
        if (handler) {
            printLine(handler(), 'terminal-result');
        } else {
            printLine('commande introuvable : ' + cmd + ' — tape "help" pour la liste', 'terminal-error');
        }
    }

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            var value = input.value;
            if (value.trim() !== '') {
                history.push(value);
                historyIndex = history.length;
            }
            runCommand(value);
            input.value = '';
            body.scrollTop = body.scrollHeight;
        } else if (e.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex -= 1;
                input.value = history[historyIndex];
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < history.length - 1) {
                historyIndex += 1;
                input.value = history[historyIndex];
            } else {
                historyIndex = history.length;
                input.value = '';
            }
            e.preventDefault();
        }
    });

    body.addEventListener('click', function () {
        input.focus();
    });

    printLine('Tape "help" pour voir les commandes disponibles.', 'terminal-result');
})();