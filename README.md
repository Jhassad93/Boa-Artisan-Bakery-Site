# Boa Artisan Bakery — site

Site institucional da Boa Artisan Bakery, padaria artesanal de origem coreana em Moema (Alameda dos Jurupis, 421, São Paulo). O site tem uma página só, com o cardápio completo em `/#cardapio`. É um site estático em HTML, CSS e JavaScript puro, sem etapa de build. Feito pela Deakins-Assad.

## Estrutura

```
index.html          página inicial e cardápio (com o CSS embutido)
404.html            página de erro
js/site.js          menu por âncora, filtros do cardápio, status aberto/fechado, menu móvel e mapa
img/                fotos em WebP (versões de 480, 720 e 1024 px) e a imagem de compartilhamento
fonts/              fontes reduzidas aos caracteres usados no site
favicon.svg
robots.txt, sitemap.xml
llms.txt            resumo da padaria em texto simples, para ferramentas de IA
vercel.json         cabeçalhos de segurança e de cache
ferramentas/        scripts de manutenção (não vão para a Vercel)
```

## Publicar na Vercel

1. Suba este repositório para o GitHub.
2. Na Vercel, clique em **Add New → Project** e importe o repositório.
3. Configure o projeto:
   - **Framework Preset:** Other;
   - **Build Command:** em branco;
   - **Output Directory:** em branco (a raiz).
4. Use **boa-artisan-bakery** como nome do projeto. Assim o endereço fica `https://boa-artisan-bakery.vercel.app`, que já está no código. Se o nome for outro, troque o domínio (ver abaixo).
5. Clique em **Deploy**. A cada push na branch principal, a Vercel publica de novo sozinha.

## Domínio próprio

Quando houver domínio (por exemplo, `www.boaartisanbakery.com.br`):

1. Na Vercel, em **Settings → Domains**, adicione o domínio e siga as instruções de DNS.
2. Troque o endereço nos arquivos que usam endereço completo (página, prévia de compartilhamento, dados estruturados, robots e sitemap):
   ```
   python ferramentas/trocar-dominio.py https://www.novodominio.com.br
   ```
3. Faça commit e push.

## llms.txt

O `llms.txt` resume a padaria em texto simples (endereço, horários, contatos, especialidades, história e links), no formato proposto em llmstxt.org. É uma proposta recente: não há garantia de que ChatGPT, Gemini ou Perplexity usem o arquivo. **Quando mudar horário, telefone, WhatsApp ou preços no site, atualize o `llms.txt` também.**

## Google Maps

O site mostra um mapa desenhado e os botões de rota funcionam sem chave nenhuma. Para trocar o desenho pelo mapa interativo do Google:

1. No Google Cloud, crie uma chave da **Maps Embed API**.
2. Restrinja a chave ao domínio do site, em "Restrições de aplicativo → Sites".
3. Cole a chave em `js/site.js`, na linha `var CHAVE_MAPS = '';`.

A política de segurança (`vercel.json`) já permite o iframe de `https://www.google.com`.

## Fontes

As fontes (Gowun Batang, Noto Sans KR e Caveat) ficam no próprio site, sem Google Fonts. Isso deixa o site mais rápido e evita mandar o IP do visitante ao Google. Cada arquivo tem só os caracteres que aparecem nas páginas.

**Sempre que entrar texto com caracteres novos** (hangul, ou acentos que ainda não aparecem no site), gere as fontes de novo:

```
pip install fonttools brotli
python ferramentas/gerar-fontes.py
```

O script precisa do Node instalado, porque baixa as fontes originais com `npm pack`.

## Segurança

O `vercel.json` aplica a todas as páginas:
- HSTS;
- Content Security Policy (só scripts do próprio site; iframe só do Google Maps);
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` e `Cross-Origin-Opener-Policy`.

O site não tem formulário, cookies, ferramenta de análise nem script de terceiros.

Se for incluído algum script externo (Google Analytics, Meta Pixel), ele precisa ser liberado na CSP. Nesse caso, o site também passa a precisar de aviso de cookies e de política de privacidade.

## Antes de ir ao ar no domínio oficial

Itens que dependem da dona da padaria:

- [ ] Número do WhatsApp do site (hoje: (11) 96844-3146; o outro candidato é (11) 98450-2465).
- [ ] Horário de funcionamento (o site usa o da bio do Instagram; o iFood mostra horários menores).
- [ ] Fotos reais da loja, do salão e da dona no lugar das ilustrativas geradas com IA (marcadas como "Imagem ilustrativa").
- [ ] A frase ilustrativa assinada pela dona em "Nossa história": substituir por uma frase real e autorizada, ou retirar.
- [ ] Autorização para usar as avaliações citadas.
- [ ] Revisão dos textos em coreano por falante nativo: 보아, 빵, 우리 이야기, 메뉴, 자연 발효.
- [ ] Link direto da loja no iFood, no lugar da busca pelo nome.
- [ ] Nome definitivo da marca (hoje: Boa Artisan Bakery, o nome no iFood).
- [ ] Ficha do Google: incluir o site e o cardápio, e usar o mesmo nome e os mesmos horários do site.

## Desempenho medido

Lighthouse 12, medido em 16/10/2026 num servidor local com os mesmos cabeçalhos do `vercel.json`:

| | Performance | Acessibilidade | Boas práticas | SEO |
| --- | --- | --- | --- | --- |
| Celular | 92–93 | 100 | 100 | 100 |
| Computador | 100 | 100 | 100 | 100 |
