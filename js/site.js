/* Boa Artisan Bakery: menu por âncora, filtros do cardápio, status aberto/fechado, menu móvel e mapa. */
(function () {
  var home = document.getElementById('inicio');
  var menu = document.getElementById('cardapio');
  var link = document.querySelector('[data-menu]');
  function mostrar() {
    var h = (location.hash || '').slice(1);
    var noMenu = h === 'cardapio' || h.indexOf('cardapio-') === 0;
    home.hidden = noMenu;
    menu.hidden = !noMenu;
    if (link) { if (noMenu) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); }
    var alvo = h && h !== 'cardapio' && h !== 'inicio' ? document.getElementById(h) : null;
    if (alvo) alvo.scrollIntoView();
    else window.scrollTo(0, 0);
  }
  var barra = document.querySelector('.chips');
  var sentinela = document.querySelector('.sentinela');
  var chipsLinks = barra ? Array.prototype.slice.call(barra.querySelectorAll('a')) : [];
  if (barra && sentinela && 'IntersectionObserver' in window) {
    var alturaTopo = function () { var t = document.querySelector('.topo'); return t ? Math.ceil(t.getBoundingClientRect().height) + 1 : 74; };
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { barra.classList.toggle('fixo', !e.isIntersecting && e.boundingClientRect.top < alturaTopo()); });
    }, { rootMargin: '-' + alturaTopo() + 'px 0px 0px 0px' }).observe(sentinela);
    var marcar = function (id) {
      chipsLinks.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('ativo', on);
        if (on) {
          a.setAttribute('aria-current', 'true');
          var c = a.parentNode, l = a.offsetLeft - 16;
          if (l < c.scrollLeft || a.offsetLeft + a.offsetWidth > c.scrollLeft + c.clientWidth) c.scrollLeft = l;
        } else a.removeAttribute('aria-current');
      });
    };
    var cats = Array.prototype.slice.call(document.querySelectorAll('.categoria'));
    var pendente = false;
    var atualizar = function () {
      pendente = false;
      if (menu.hidden) return;
      var limite = barra.getBoundingClientRect().bottom + 24, atual = null;
      cats.forEach(function (c) { if (c.getBoundingClientRect().top <= limite) atual = c.id; });
      if (atual) marcar(atual); else chipsLinks.forEach(function (a) { a.classList.remove('ativo'); a.removeAttribute('aria-current'); });
    };
    window.addEventListener('scroll', function () { if (!pendente) { pendente = true; requestAnimationFrame(atualizar); } }, { passive: true });
    window.addEventListener('hashchange', function () { requestAnimationFrame(atualizar); });
  }
  window.addEventListener('hashchange', mostrar);
  mostrar();
})();

(function () {
  /* Horário da loja em minutos desde a meia-noite (0 = domingo).
     Feriados: horário de fim de semana (7h30 às 12h), exceto às segundas, quando a loja fecha. Confirmar com a dona. */
  var HORARIO = { 0: [450, 720], 1: null, 2: [450, 1110], 3: [450, 1110], 4: [450, 1110], 5: [450, 1110], 6: [450, 720] };
  var FERIADO = [450, 720];
  var NOMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  function fmt(m) { var h = Math.floor(m / 60), r = m % 60; return h + 'h' + (r ? (r < 10 ? '0' : '') + r : ''); }
  function pascoa(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
        g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
        l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
        mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
    return Date.UTC(y, mes - 1, dia);
  }
  function chave(t) { var d = new Date(t); return d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate(); }
  var cacheFeriados = {};
  function feriados(y) {
    if (cacheFeriados[y]) return cacheFeriados[y];
    var lista = {}, dia = 86400000, p = pascoa(y);
    /* Nacionais, estado e município de São Paulo */
    [[1,1],[1,25],[4,21],[5,1],[7,9],[9,7],[10,12],[11,2],[11,15],[11,20],[12,25]].forEach(function (x) { lista[chave(Date.UTC(y, x[0] - 1, x[1]))] = true; });
    lista[chave(p - 2 * dia)] = true;   /* Sexta-feira Santa */
    lista[chave(p + 60 * dia)] = true;  /* Corpus Christi */
    return (cacheFeriados[y] = lista);
  }
  function agora() {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { t: Date.UTC(+p.year, +p.month - 1, +p.day), m: parseInt(p.hour, 10) * 60 + parseInt(p.minute, 10) };
  }
  function horarioDe(t) {
    var d = new Date(t), wd = d.getUTCDay();
    var fer = !!feriados(d.getUTCFullYear())[chave(t)];
    if (fer && wd !== 1) return { h: FERIADO, fer: true, wd: wd };
    return { h: HORARIO[wd], fer: fer, wd: wd };
  }
  function atualizarStatus() {
    var el = document.getElementById('status'); if (!el) return;
    var n = agora(), hoje = horarioDe(n.t), h = hoje.h, cls = 'fechado', txt, extra = hoje.fer ? ' (feriado)' : '';
    if (h && n.m >= h[0] && n.m < h[1]) {
      if (h[1] - n.m <= 60) { cls = 'breve'; txt = 'Fecha em breve, às ' + fmt(h[1]) + extra; }
      else { cls = 'aberto'; txt = 'Aberto agora · fecha às ' + fmt(h[1]) + extra; }
    } else if (h && n.m < h[0]) {
      txt = 'Fechado agora · abre hoje às ' + fmt(h[0]) + extra;
    } else {
      for (var i = 1; i <= 8; i++) {
        var prox = horarioDe(n.t + i * 86400000);
        if (prox.h) { txt = 'Fechado agora · abre ' + (i === 1 ? 'amanhã' : NOMES[prox.wd]) + ' às ' + fmt(prox.h[0]); break; }
      }
    }
    el.className = 'status ' + cls;
    el.querySelector('.txt').textContent = txt;
    document.querySelectorAll('.horarios tr[data-dias]').forEach(function (tr) {
      tr.classList.toggle('hoje', tr.getAttribute('data-dias').split(',').indexOf(String(hoje.fer && hoje.wd !== 1 ? 0 : hoje.wd)) > -1);
    });
  }
  try { atualizarStatus(); setInterval(atualizarStatus, 60000); } catch (e) {}

  document.documentElement.lang = 'pt-BR';

  /* Mede o cabeçalho e a barra de filtros para a barra nunca ficar escondida atrás do topo. */
  var topo = document.querySelector('.topo'), barraChips = document.querySelector('.chips'), trilho = barraChips && barraChips.querySelector('.miolo');
  function medir() {
    if (topo) document.documentElement.style.setProperty('--altura-topo', Math.ceil(topo.getBoundingClientRect().height) + 'px');
    if (barraChips && barraChips.offsetHeight) document.documentElement.style.setProperty('--altura-chips', Math.ceil(barraChips.offsetHeight) + 'px');
  }
  medir();
  if ('ResizeObserver' in window) { var ro = new ResizeObserver(medir); if (topo) ro.observe(topo); if (barraChips) ro.observe(barraChips); }
  window.addEventListener('resize', medir);
  window.addEventListener('hashchange', function () { requestAnimationFrame(medir); });
  function fimTrilho() { if (trilho) trilho.classList.toggle('no-fim', trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 4); }
  if (trilho) { trilho.addEventListener('scroll', fimTrilho, { passive: true }); window.addEventListener('resize', fimTrilho); window.addEventListener('hashchange', function () { requestAnimationFrame(fimTrilho); }); fimTrilho(); }

  var botaoMenu = document.querySelector('.abrir-menu'), painel = document.getElementById('menu-movel');
  function fecharMenu() { if (!painel) return; painel.hidden = true; botaoMenu.setAttribute('aria-expanded', 'false'); botaoMenu.setAttribute('aria-label', 'Abrir menu'); }
  if (botaoMenu && painel) {
    botaoMenu.addEventListener('click', function () {
      var abrir = painel.hidden;
      painel.hidden = !abrir;
      botaoMenu.setAttribute('aria-expanded', String(abrir));
      botaoMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    });
    painel.addEventListener('click', function (e) { if (e.target.closest('a')) fecharMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !painel.hidden) { fecharMenu(); botaoMenu.focus(); } });
  }

  var pular = document.querySelector('.pular');
  if (pular) pular.addEventListener('click', function (e) {
    e.preventDefault();
    var vista = document.querySelector('.vista:not([hidden])'), alvo = vista && vista.querySelector('h1');
    if (alvo) { alvo.setAttribute('tabindex', '-1'); alvo.focus(); }
  });

  var whats = document.querySelector('.whats'), rodape = document.querySelector('.rodape');
  if (whats && rodape && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { whats.classList.toggle('some', e.isIntersecting); }); }).observe(rodape);
  }

  /* Google Maps: cole aqui a chave da Maps Embed API (Google Cloud), restrita ao domínio do site.
     Sem chave, a página mostra o mapa desenhado e os botões de rota continuam funcionando. */
  var CHAVE_MAPS = '';
  var mapa = document.getElementById('mapa');
  if (CHAVE_MAPS && mapa) {
    var f = document.getElementById('mapa-google');
    f.src = 'https://www.google.com/maps/embed/v1/place?key=' + encodeURIComponent(CHAVE_MAPS) +
      '&q=' + encodeURIComponent(mapa.getAttribute('data-consulta')) + '&zoom=16&language=pt-BR';
    f.hidden = false;
    document.getElementById('mapa-reserva').hidden = true;
  }
})();
