"""Gera as fontes do site só com os caracteres usados nas páginas.

Quando rodar: sempre que entrar texto com caracteres novos (hangul ou acentos
que ainda não aparecem no site). Sem isso, esses caracteres aparecem numa
fonte do sistema.

Como rodar, na raiz do repositório:
    pip install fonttools brotli
    python ferramentas/gerar-fontes.py

O script baixa os pacotes @fontsource (npm pack) para ferramentas/fontes-origem/,
que fica fora do Git, e grava os arquivos em fonts/.
"""
import os, re, subprocess, tarfile, glob
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.merge import Merger

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEM = os.path.join(RAIZ, 'ferramentas', 'fontes-origem')
PACOTES = {
    'caveat': ('@fontsource/caveat@5.1.0', 'Caveat', [400]),
    'gowun': ('@fontsource/gowun-batang@5.1.0', 'Gowun Batang', [400, 700]),
    'noto': ('@fontsource/noto-sans-kr@5.1.0', 'Noto Sans KR', [400, 500, 700]),
}

def caracteres():
    texto = ''
    for nome in ['index.html', '404.html', 'js/site.js']:
        with open(os.path.join(RAIZ, nome), encoding='utf-8') as f:
            texto += f.read()
    extras = {0xA0, 0x2019, 0x201C, 0x201D, 0x2014, 0x2013, 0x2026, 0x2022}
    return set(range(32, 127)) | {ord(c) for c in texto if ord(c) > 126} | extras

def baixar(pacote, apelido):
    destino = os.path.join(ORIGEM, apelido)
    if os.path.isdir(destino):
        return destino
    os.makedirs(ORIGEM, exist_ok=True)
    arquivo = subprocess.check_output(['npm', 'pack', pacote, '--silent'], cwd=ORIGEM, text=True).strip().splitlines()[-1]
    with tarfile.open(os.path.join(ORIGEM, arquivo)) as t:
        t.extractall(ORIGEM, filter='data')
    os.rename(os.path.join(ORIGEM, 'package'), destino)
    return destino

def faixas(texto):
    saida = []
    for parte in texto.split(','):
        parte = parte.strip().replace('U+', '')
        if '-' in parte:
            a, b = parte.split('-')
            saida.append((int(a, 16), int(b, 16)))
        else:
            saida.append((int(parte, 16), int(parte, 16)))
    return saida

def main():
    usados = caracteres()
    os.makedirs(os.path.join(RAIZ, 'fonts'), exist_ok=True)
    temporarios = []
    for apelido, (pacote, _familia, pesos) in PACOTES.items():
        pasta = baixar(pacote, apelido)
        for peso in pesos:
            css = open(os.path.join(pasta, f'{peso}.css'), encoding='utf-8').read()
            partes = []
            for bloco in re.findall(r'@font-face\s*{[^}]*}', css):
                cps = [c for c in usados if any(a <= c <= b for a, b in faixas(re.search(r'unicode-range:\s*([^;]+);', bloco).group(1)))]
                if not cps:
                    continue
                arquivo = re.search(r'url\(\./files/([^)]+\.woff2)\)', bloco).group(1)
                fonte = TTFont(os.path.join(pasta, 'files', arquivo))
                opcoes = subset.Options(); opcoes.layout_features = ['*']; opcoes.notdef_outline = True; opcoes.name_IDs = ['*']
                corte = subset.Subsetter(opcoes); corte.populate(unicodes=cps); corte.subset(fonte)
                fonte.flavor = None
                caminho = os.path.join(ORIGEM, f'parte-{apelido}{peso}-{len(partes)}.ttf')
                fonte.save(caminho); partes.append(caminho); temporarios.append(caminho)
            final = TTFont(partes[0]) if len(partes) == 1 else Merger().merge(partes)
            final.flavor = 'woff2'
            saida = os.path.join(RAIZ, 'fonts', f'{apelido}-{peso}.woff2')
            final.save(saida)
            print(f'{saida}: {os.path.getsize(saida) // 1024} KB')
    for t in temporarios:
        os.remove(t)

if __name__ == '__main__':
    main()
