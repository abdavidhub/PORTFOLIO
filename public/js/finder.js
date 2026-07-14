(function () {
    var grid = document.getElementById('finder-grid');
    var detail = document.getElementById('finder-detail');
    var backBtn = document.getElementById('finder-back');
    if (!grid || !detail || !backBtn) return;

    var titleEl = document.getElementById('finder-detail-title');
    var tagsEl = document.getElementById('finder-detail-technologie');
    var descEl = document.getElementById('finder-detail-description');
    var linksEl = document.getElementById('finder-detail-links');
    var imageEl = document.getElementById('finder-detail-image');
    var countEl = document.getElementById('finder-count');

    var totalItems = grid.querySelectorAll('.finder-item').length;

    function statusTexteGrille() {
        return totalItems + ' élément' + (totalItems > 1 ? 's' : '');
    }

    function openProjet(item) {
        titleEl.textContent = item.dataset.titre || '';
        tagsEl.textContent = item.dataset.technologie || '';
        descEl.textContent = item.dataset.description || '';

        var image = item.dataset.image;
        if (imageEl) {
            if (image) {
                imageEl.src = image;
                imageEl.hidden = false;
            } else {
                imageEl.src = '';
                imageEl.hidden = true;
            }
        }

        linksEl.innerHTML = '';
        var code = item.dataset.code;
        var demo = item.dataset.demo;
        if (code) {
            var a1 = document.createElement('a');
            a1.href = code;
            a1.target = '_blank';
            a1.rel = 'noopener';
            a1.textContent = 'Github';
            linksEl.appendChild(a1);
        }
        if (demo) {
            var a2 = document.createElement('a');
            a2.href = demo;
            a2.target = '_blank';
            a2.rel = 'noopener';
            a2.textContent = 'Démo';
            linksEl.appendChild(a2);
        }

        if (countEl) {
            countEl.textContent = item.dataset.titre || '';
        }

        item.classList.add('finder-item-opening');
        setTimeout(function () {
            grid.hidden = true;
            detail.hidden = false;
            backBtn.focus();
            item.classList.remove('finder-item-opening');
        }, 180);
    }

    grid.addEventListener('click', function (e) {
        var item = e.target.closest('.finder-item');
        if (item) openProjet(item);
    });

    grid.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            var item = e.target.closest('.finder-item');
            if (item) {
                e.preventDefault();
                openProjet(item);
            }
        }
    });

    backBtn.addEventListener('click', function () {
        detail.hidden = true;
        grid.hidden = false;
        if (countEl) countEl.textContent = statusTexteGrille();
    });
})();