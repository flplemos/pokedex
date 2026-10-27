# Pokédex · Felps Edition

Pokédex feita em HTML, CSS e JavaScript puros (sem build), usando a [PokéAPI](https://pokeapi.co/) e [Chart.js](https://www.chartjs.org/).

**Demo:** https://flplemos.github.io/pokedex/index.html

## Recursos

- Busca por nome ou número (Enter), com navegação anterior/próximo e link direto (`#pikachu`)
- Artwork oficial, cores por tipo e gráfico das estatísticas base
- Estados de carregando, erro de conexão e "não encontrado"
- Tema claro/escuro (segue o sistema, com alternância manual)
- Acessível: contraste ≥ 4.5:1, foco visível, alvos de toque ≥ 44px, tabela de stats para leitores de tela e respeito a `prefers-reduced-motion`

## Rodando localmente

Qualquer servidor estático serve, por exemplo:

```bash
python -m http.server 5502
```
