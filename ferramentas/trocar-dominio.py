"""Troca o domínio do site em todos os arquivos que usam endereço absoluto.

Uso, na raiz do repositório:
    python ferramentas/trocar-dominio.py https://www.novodominio.com.br
"""
import os, sys

ATUAL = 'https://boa-artisan-bakery.vercel.app'
ARQUIVOS = ['index.html', 'robots.txt', 'sitemap.xml', 'ferramentas/trocar-dominio.py']

def main():
    if len(sys.argv) != 2 or not sys.argv[1].startswith('https://'):
        sys.exit('Informe o novo domínio com https://, sem barra no final.')
    novo = sys.argv[1].rstrip('/')
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for nome in ARQUIVOS:
        caminho = os.path.join(raiz, nome)
        with open(caminho, encoding='utf-8') as f:
            texto = f.read()
        n = texto.count(ATUAL)
        with open(caminho, 'w', encoding='utf-8') as f:
            f.write(texto.replace(ATUAL, novo))
        print(f'{nome}: {n} troca(s)')

if __name__ == '__main__':
    main()
