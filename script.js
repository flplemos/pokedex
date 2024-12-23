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
            const stats = pokemon.stats;
            let delayed;
            if (imageUrl) {
                pokemonImg.src = imageUrl;
                pokemonImg.alt = `Imagem do Pokémon ${pokemon.name}`;
            } else {
                pokemonImg.src = '';
                pokemonImg.alt = 'Imagem não disponível';
            }

            pokemonInfo.innerHTML = `
                <div class="pokemon-info">
                    <p><strong>Nome:</strong> ${pokemon.name}</p>
                    <p><strong>ID:</strong> ${pokemon.id}</p>
                    <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
                    <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
                    <p><strong>Tipos:</strong> ${pokemon.types.map(type => type.type.name).join(', ')}</p>
                    <p><strong>Habilidades:</strong> ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
                    <canvas id="statsChart" width="200" height="200"></canvas>
                </div>
            `;
            renderChart(stats);

            function renderChart(stats) {
                const ctx = document.getElementById('statsChart').getContext('2d');
                const labels = stats.map(stat => stat.stat.name); 
                const data = stats.map(stat => stat.base_stat); 

                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Estatísticas',
                            data: data,
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.8)',
                                'rgba(54, 162, 235, 0.8)',
                                'rgba(255, 206, 86, 0.8)',
                                'rgba(75, 192, 192, 0.8)',
                                'rgba(153, 102, 255, 0.8)',
                                'rgba(255, 159, 64, 0.8)'
                            ],
                            borderColor: [
                                'rgba(75, 192, 192, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                display: true,
                                labels: {
                                    usePointStyle: true,
                                    boxWidth: 0,
                                    font: {
                                        family: 'Roboto',
                                        size: 16,
                                        weight: 'bold' 
                                    },
                                    color: 'black',  
                                    padding: 10,
                                    textAlign: 'center',
                                },
                                onClick: null,
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    font: {
                                        family: 'Roboto',
                                        size: 14,
                                        weight: 'bold'
                                    },
                                    color: 'black' 
                                }
                            },
                            x: {
                                ticks: {
                                    font: {
                                        family: "Roboto",
                                        size: 14,
                                        weight: 'bold' 
                                    },
                                    color: 'black' 
                                }
                            }
                        },
                        animation: {
                            onComplete: () => {
                                delayed = true;
                            },
                            delay: (context) => {
                                let delay = 0;
                                if (context.type === 'data' && context.mode === 'default' && !delayed) {
                                    delay = context.dataIndex * 300 + context.datasetIndex * 100;
                                }
                                return delay;
                            },
                        },
                    }
                });
            }

        })
        .catch(error => {
            console.error(error);
            pokemonInfo.innerHTML = `<p>Erro: Pokémon "${pokemonNameValue}" não encontrado. Verifique o nome e tente novamente.</p>`;
            pokemonImg.src = '';
            pokemonImg.alt = '';
        });
}

function carregarPokemonPadrao() {
    const pokemonPadrao = 'gengar';
    pokemonName.value = pokemonPadrao;
    apiPokemon(new Event('submit')); 
}

window.onload = carregarPokemonPadrao;
