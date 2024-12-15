const pokemonName = document.querySelector('#pokemonName');
const btnSubmit = document.querySelector('.btnSubmit');
const pokemonImg = document.querySelector('#pokemonImg');
const form = document.querySelector('#form');
const pokemonInfo = document.querySelector('#pokemonInfo'); 

btnSubmit.addEventListener('click', apiPokemon);

function apiPokemon(e) {
    e.preventDefault(); 
    const pokemonNameValue = pokemonName.value.trim().toLowerCase(); 
    if (!pokemonNameValue) {
        pokemonInfo.innerHTML = '<p>Por favor, insira o nome de um Pokémon.</p>';
        return;
    }

    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonNameValue}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Pokémon não encontrado');
            }
            return response.json();
        })
        .then(pokemon => {
            const officialArtwork = pokemon.sprites.other['official-artwork']?.front_default;
            const homeDefault = pokemon.sprites.other.home?.front_default;
            const defaultSprite = pokemon.sprites.front_default;
            const imageUrl = officialArtwork || homeDefault || defaultSprite;
            if (imageUrl) {
                pokemonImg.src = imageUrl;
                pokemonImg.alt = `Imagem do Pokémon ${pokemon.name}`;
            } else {
                pokemonImg.src = '';
                pokemonImg.alt = 'Imagem não disponível';
            }

            pokemonInfo.innerHTML = `
                <div id="infoPoke" class="pokemon-info"><p><strong>Nome:</strong> ${pokemon.name}</p>
                <p><strong>ID:</strong> ${pokemon.id}</p>
                <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
                <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
                <p><strong>Tipos:</strong> ${pokemon.types.map(type => type.type.name).join(', ')}</p>
                <p><strong>Habilidades:</strong> ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
                <p><strong>Estatísticas Base:</strong></p>
                <ul>
                    ${pokemon.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
                </ul>
                </div>
            `;
        })
        .catch(error => {
            console.error(error);
            pokemonInfo.innerHTML = `<p>Erro: Pokémon não encontrado. Verifique o nome e tente novamente.</p>`;
            pokemonImg.src = '';
            pokemonImg.alt = '';
        });
}


function carregarPokemonPadrao() {
    const pokemonPadrao = 'gengar';
    pokemonName.value = pokemonPadrao; 
    apiPokemon(new Event('click')); 
}

window.onload = carregarPokemonPadrao;