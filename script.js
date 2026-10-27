const API = 'https://pokeapi.co/api/v2/pokemon/';
const POKEMON_PADRAO = 'gengar';
const SUGESTOES = ['pikachu', 'charizard', 'eevee', 'lucario'];

// Cores com contraste >= 4.5:1 contra texto branco.
const TIPOS = {
    normal:   { nome: 'Normal',   cor: '#6b6b4a' },
    fire:     { nome: 'Fogo',     cor: '#c2410c' },
    water:    { nome: 'Água',     cor: '#2563c9' },
    electric: { nome: 'Elétrico', cor: '#8a6d00' },
    grass:    { nome: 'Planta',   cor: '#3f7d20' },
    ice:      { nome: 'Gelo',     cor: '#1f7a80' },
    fighting: { nome: 'Lutador',  cor: '#b02a22' },
    poison:   { nome: 'Venenoso', cor: '#8b3a96' },
    ground:   { nome: 'Terrestre', cor: '#8a6a1f' },
    flying:   { nome: 'Voador',   cor: '#6a55c8' },
    psychic:  { nome: 'Psíquico', cor: '#c2185b' },
    bug:      { nome: 'Inseto',   cor: '#5f7a0f' },
    rock:     { nome: 'Pedra',    cor: '#7d6a24' },
    ghost:    { nome: 'Fantasma', cor: '#5b4a8a' },
    dragon:   { nome: 'Dragão',   cor: '#5a2fd6' },
    dark:     { nome: 'Sombrio',  cor: '#5a4638' },
    steel:    { nome: 'Aço',      cor: '#5f6b80' },
    fairy:    { nome: 'Fada',     cor: '#b0457a' },
};

const STATS = {
    'hp': 'HP',
    'attack': 'Ataque',
    'defense': 'Defesa',
    'special-attack': 'Atq. Esp.',
    'special-defense': 'Def. Esp.',
    'speed': 'Velocidade',
};

const $ = (seletor) => document.querySelector(seletor);

const form = $('#form');
const pokemonName = $('#pokemonName');
const status = $('#status');
const cartao = $('#cartao');
const pokemonImg = $('#pokemonImg');
const btnAnterior = $('#anterior');
const btnProximo = $('#proximo');

const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');

let pokemonAtual = null;
let grafico = null;
let requisicao = null;

// ---------- Busca ----------

function normalizar(valor) {
    const texto = valor
        .trim()
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/^#/, '')
        .replace(/[\s.']+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    return /^\d+$/.test(texto) ? String(Number(texto)) : texto;
}

async function buscarPokemon(consulta) {
    const termo = normalizar(String(consulta));
    if (!termo || termo === '0') {
        mostrarStatus('vazio');
        pokemonName.focus();
        return;
    }

    requisicao?.abort();
    requisicao = new AbortController();
    mostrarCarregando();

    try {
        const resposta = await fetch(API + termo, { signal: requisicao.signal });
        if (resposta.status === 404) {
            mostrarStatus('nao-encontrado', consulta);
            return;
        }
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

        const pokemon = await resposta.json();
        renderizar(pokemon);
        history.replaceState(null, '', '#' + pokemon.name);
    } catch (erro) {
        if (erro.name === 'AbortError') return;
        console.error(erro);
        mostrarStatus('erro', consulta);
    }
}

form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    buscarPokemon(pokemonName.value);
});

btnAnterior.addEventListener('click', () => pokemonAtual && buscarPokemon(pokemonAtual.id - 1));
btnProximo.addEventListener('click', () => pokemonAtual && buscarPokemon(pokemonAtual.id + 1));

window.addEventListener('hashchange', () => {
    const termo = decodeURIComponent(location.hash.slice(1));
    if (termo && termo !== pokemonAtual?.name) buscarPokemon(termo);
});

// ---------- Estados ----------

function mostrarCarregando() {
    if (!cartao.hidden) {
        cartao.setAttribute('aria-busy', 'true');
        status.replaceChildren();
        anunciar('Carregando…');
        return;
    }
    status.replaceChildren(criar('div', { className: 'spinner', 'aria-hidden': 'true' }), criar('p', {}, 'Carregando…'));
}

// Região viva só para leitores de tela quando o cartão já está visível.
function anunciar(texto) {
    let aviso = $('#aviso');
    if (!aviso) {
        aviso = criar('p', { id: 'aviso', className: 'sr-only', role: 'status' });
        document.body.append(aviso);
    }
    aviso.textContent = texto;
}

function mostrarStatus(tipo, consulta = '') {
    cartao.hidden = true;
    cartao.removeAttribute('aria-busy');
    const acoes = criar('div', { className: 'status-acoes' });

    if (tipo === 'vazio') {
        status.replaceChildren(
            criar('strong', {}, 'Digite o nome ou o número de um Pokémon.'),
            criar('p', {}, 'Algumas ideias:'),
            acoes,
        );
    } else if (tipo === 'nao-encontrado') {
        status.replaceChildren(
            criar('strong', {}, `Nenhum Pokémon encontrado para “${String(consulta).trim()}”.`),
            criar('p', {}, 'Confira a grafia ou tente um número de 1 a 1025. Que tal um destes?'),
            acoes,
        );
    } else {
        const tentar = criar('button', { type: 'button', className: 'botao-primario' }, 'Tentar de novo');
        tentar.addEventListener('click', () => buscarPokemon(consulta));
        acoes.append(tentar);
        status.replaceChildren(
            criar('strong', {}, 'Não foi possível carregar os dados.'),
            criar('p', {}, 'Verifique sua conexão e tente novamente.'),
            acoes,
        );
        return;
    }

    for (const nome of SUGESTOES) {
        const chip = criar('button', { type: 'button', className: 'chip' }, nome);
        chip.addEventListener('click', () => {
            pokemonName.value = nome;
            buscarPokemon(nome);
        });
        acoes.append(chip);
    }
}

// ---------- Renderização ----------

function renderizar(pokemon) {
    pokemonAtual = pokemon;
    status.replaceChildren();
    anunciar(`${pokemon.name}, número ${pokemon.id}, carregado.`);

    const tipos = pokemon.types.map((t) => TIPOS[t.type.name] ?? { nome: t.type.name, cor: '#5f6b80' });
    cartao.style.setProperty('--type', tipos[0].cor);
    cartao.style.setProperty('--type-2', (tipos[1] ?? tipos[0]).cor);

    const imagem = pokemon.sprites.other?.['official-artwork']?.front_default
        || pokemon.sprites.other?.home?.front_default
        || pokemon.sprites.front_default;
    if (imagem) {
        pokemonImg.src = imagem;
        pokemonImg.alt = `Artwork oficial de ${pokemon.name}`;
        pokemonImg.hidden = false;
    } else {
        pokemonImg.removeAttribute('src');
        pokemonImg.hidden = true;
    }

    $('#pokemonNumero').textContent = '#' + String(pokemon.id).padStart(4, '0');
    $('#pokemonNome').textContent = pokemon.name.replace(/-/g, ' ');
    $('#pokemonTipos').replaceChildren(...tipos.map((tipo) => {
        const item = criar('li', { className: 'tipo' }, tipo.nome);
        item.style.setProperty('--cor', tipo.cor);
        return item;
    }));
    $('#pokemonAltura').textContent = formatar(pokemon.height / 10) + ' m';
    $('#pokemonPeso').textContent = formatar(pokemon.weight / 10) + ' kg';
    $('#pokemonHabilidades').replaceChildren(...pokemon.abilities.map((h) => {
        const item = criar('li', {}, h.ability.name.replace(/-/g, ' '));
        if (h.is_hidden) item.append(' ', criar('span', { className: 'oculta' }, '(oculta)'));
        return item;
    }));

    btnAnterior.disabled = pokemon.id <= 1;

    pokemonName.value = pokemon.name;
    cartao.removeAttribute('aria-busy');
    cartao.hidden = false;
    renderizarGrafico(pokemon);
}

function renderizarGrafico(pokemon) {
    const rotulos = pokemon.stats.map((s) => STATS[s.stat.name] ?? s.stat.name);
    const valores = pokemon.stats.map((s) => s.base_stat);
    const canvas = $('#statsChart');

    $('#statsTotal').textContent = valores.reduce((a, b) => a + b, 0);
    $('#statsTabela').replaceChildren(...rotulos.map((rotulo, i) => {
        const linha = criar('tr');
        linha.append(criar('th', { scope: 'row' }, rotulo), criar('td', {}, String(valores[i])));
        return linha;
    }));

    if (!window.Chart) return;

    const css = getComputedStyle(document.documentElement);
    const corTexto = css.getPropertyValue('--text').trim();
    const corSuave = css.getPropertyValue('--muted').trim();
    const corGrade = css.getPropertyValue('--border').trim();
    const corTipo = getComputedStyle(cartao).getPropertyValue('--type').trim();

    grafico?.destroy();
    grafico = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: rotulos,
            datasets: [{
                data: valores,
                backgroundColor: corTipo,
                borderRadius: 6,
                borderSkipped: false,
                barPercentage: .7,
                categoryPercentage: .9,
            }],
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: movimentoReduzido.matches ? false : { duration: 600, easing: 'easeOutQuart' },
            layout: { padding: { right: 36 } },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            },
            scales: {
                x: {
                    min: 0,
                    max: Math.max(160, ...valores),
                    grid: { color: corGrade },
                    border: { display: false },
                    ticks: { color: corSuave, font: { family: 'Nunito, system-ui, sans-serif', size: 12 } },
                },
                y: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: { color: corTexto, font: { family: 'Nunito, system-ui, sans-serif', size: 13, weight: '700' } },
                },
            },
        },
        plugins: [{
            id: 'valores',
            afterDatasetsDraw(chart) {
                const { ctx } = chart;
                ctx.save();
                ctx.fillStyle = corTexto;
                ctx.font = '700 13px Nunito, system-ui, sans-serif';
                ctx.textBaseline = 'middle';
                chart.getDatasetMeta(0).data.forEach((barra, i) => {
                    ctx.fillText(valores[i], barra.x + 6, barra.y);
                });
                ctx.restore();
            },
        }],
    });
}

// ---------- Tema ----------

const temaEscuroSistema = window.matchMedia('(prefers-color-scheme: dark)');

function temaAtual() {
    return document.documentElement.dataset.theme || (temaEscuroSistema.matches ? 'dark' : 'light');
}

$('#alternarTema').addEventListener('click', () => {
    const novo = temaAtual() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = novo;
    try { localStorage.setItem('tema', novo); } catch (e) {}
    if (pokemonAtual) renderizarGrafico(pokemonAtual);
});

temaEscuroSistema.addEventListener('change', () => {
    if (pokemonAtual && !document.documentElement.dataset.theme) renderizarGrafico(pokemonAtual);
});

// ---------- Utilitários ----------

function criar(tag, atributos = {}, texto) {
    const el = document.createElement(tag);
    for (const [chave, valor] of Object.entries(atributos)) {
        if (chave === 'className') el.className = valor;
        else el.setAttribute(chave, valor);
    }
    if (texto !== undefined) el.textContent = texto;
    return el;
}

function formatar(numero) {
    return numero.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

// ---------- Início ----------

document.fonts?.ready.then(() => pokemonAtual && grafico && renderizarGrafico(pokemonAtual));

buscarPokemon(decodeURIComponent(location.hash.slice(1)) || POKEMON_PADRAO);
