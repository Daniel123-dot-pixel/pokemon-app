import { LitElement, html, css } from 'lit';
import './pokemon-card.js'; 

class PokemonComponent extends LitElement {
  static styles = css`
    .filter-controls {
      text-align: center;
      margin-bottom: 16px;
    }

    .filter-controls select, .filter-controls input {
      padding: 8px;
      margin-right: 8px;
    }

    .pokemon-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }

    .modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      width: 80%;
      max-width: 500px;
      color: #333;
      border: 2px solid gold;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }

    .modal h3 {
      margin-top: 0;
      color: #007bff;
    }
    
    .modal p, .modal li {
      color: #555; 
    }

    .close-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 20px;
    }
  `;

  static properties = {
    pokemons: { type: Array },
    filteredPokemons: { type: Array },
    types: { type: Array },
    selectedFilter: { type: String },
    filterValue: { type: String },
    sortOrder: { type: String },
    loading: { type: Boolean },
    error: { type: String },
    showModal: { type: Boolean },
    selectedPokemonEvolutions: { type: Array },
    selectedPokemon: { type: Object }, 
  };

  constructor() {
    super();
    this.pokemons = [];
    this.filteredPokemons = [];
    this.types = [];
    this.selectedFilter = '';
    this.filterValue = '';
    this.sortOrder = 'asc';
    this.loading = true;
    this.error = '';
    this.showModal = false;
    this.selectedPokemonEvolutions = [];
    this.selectedPokemon = null; 
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchTypes();
    this.fetchPokemons();
  }

  async fetchTypes() {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/type');
      const data = await response.json();
      this.types = data.results;
    } catch (error) {
      console.error('Error al buscar tipos de Pokemones:', error);
      this.error = 'Error al cargar los tipos de Pokemones.';
    }
  }
  //Búsqueda asíncorna de pokemones
  async fetchPokemons() {
    try {
      this.loading = true;
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
      const data = await response.json();
      this.pokemons = data.results;
  
      const pokemonDetailsPromises = this.pokemons.map(pokemon =>
        fetch(pokemon.url).then(res => res.json())
      );
  
      this.pokemons = await Promise.all(pokemonDetailsPromises);
      this.applyFilters();
    } catch (error) {
      console.error('Error al obtener la lista de Pokemones:', error);
      this.error = 'Error al cargar la lista de Pokemones.';
    } finally {
      this.loading = false;
    }
  }
  //Aplicación de filtros
  applyFilters() {
    let filtered = this.pokemons;

    if (this.selectedFilter === 'type' && this.filterValue) {
      filtered = filtered.filter(pokemon =>
        pokemon.types.some(pokemonType => pokemonType.type.name === this.filterValue)
      );
    } else if (this.selectedFilter === 'name' && this.filterValue) {
      filtered = filtered.filter(pokemon =>
        pokemon.name.toLowerCase().includes(this.filterValue.toLowerCase())
      );
    }

    if (this.selectedFilter === 'sort') {
      filtered.sort((a, b) => {
        return this.sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
    }

    this.filteredPokemons = filtered;
  }

  async handlePokemonClick(event) {
    const pokemonName = event.detail.name;
    this.selectedPokemon = this.pokemons.find(pokemon => pokemon.name === pokemonName);
    if (this.selectedPokemon) {
      await this.fetchEvolutions(this.selectedPokemon.name);
    }
    this.showModal = true;
  }
  //Búsqueda asíncrone de Evoluciones por nombre de pokemon
  async fetchEvolutions(pokemonName) {
    try {
      const pokemon = this.pokemons.find(p => p.name === pokemonName);
      if (!pokemon) {
        throw new Error('Pokémon no encontrado');
      }

      const speciesResponse = await fetch(pokemon.species.url);
      const speciesData = await speciesResponse.json();
      const evolutionChainUrl = speciesData.evolution_chain.url;
      const evolutionResponse = await fetch(evolutionChainUrl);
      const evolutionData = await evolutionResponse.json();

      this.selectedPokemonEvolutions = this.parseEvolutions(evolutionData.chain);
    } catch (error) {
      console.error('Error al obtener evoluciones:', error);
      this.selectedPokemonEvolutions = [];
    }
  }

  parseEvolutions(chain) {
    const evolutions = [];
    let currentStage = chain;

    do {
      evolutions.push(currentStage.species.name);
      currentStage = currentStage.evolves_to[0];
    } while (currentStage);

    return evolutions;
  }

  handleFilterChange(event) {
    this.selectedFilter = event.target.value;
    this.applyFilters();
  }
  
  handleValueChange(event) {
    this.filterValue = event.target.value;
    this.applyFilters();
  }
  
  handleSortChange(event) {
    this.sortOrder = event.target.value;
    this.applyFilters();
  }
  

  closeModal() {
    this.showModal = false;
    this.selectedPokemon = null;
  }

  render() {
    return html`
      <div class="filter-controls">
        <label for="filter-select">Filtro:</label>
        <select id="filter-select" @change="${this.handleFilterChange}">
          <option value="">Selecciona un filtro</option>
          <option value="type">Tipo</option>
          <option value="name">Nombre</option>
          <option value="sort">Alfabéticamente</option>
        </select>

        ${this.selectedFilter === 'type'
          ? html`
              <label for="type-filter">Tipo:</label>
              <select id="type-filter" @change="${this.handleValueChange}">
                <option value="">Todos los Tipos</option>
                ${this.types.map(
                  (type) => html`<option value="${type.name}">${type.name}</option>`
                )}
              </select>
            `
          : this.selectedFilter === 'name'
          ? html`
              <label for="name-filter">Nombre:</label>
              <input
                id="name-filter"
                type="text"
                placeholder="Buscando Pokémon..."
                @input="${this.handleValueChange}"
              />
            `
          : this.selectedFilter === 'sort'
          ? html`
              <label for="sort-order">Orden:</label>
              <select id="sort-order" @change="${this.handleSortChange}">
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            `
          : html``
        }
      </div>

      <div class="pokemon-list">
        ${this.loading
          ? html`<p>Cargando lista Pokémon...</p>`
          : this.error
          ? html`<p>${this.error}</p>`
          : this.filteredPokemons.length > 0
          ? this.filteredPokemons.map(
              (pokemon) => html`
                <pokemon-card
                  name="${pokemon.name}"
                  imageUrl="${pokemon.sprites.front_default}"
                  @pokemon-click="${this.handlePokemonClick}"
                ></pokemon-card>
              `
            )
          : html`<p>No se han encontrado Pokemones con los filtros actuales.</p>`}
      </div>

      ${this.showModal && this.selectedPokemon ? html`
        <div class="modal-overlay" @click="${this.closeModal}"></div>
        <div class="modal">
          <h3>${this.selectedPokemon.name}</h3>
          <img src="${this.selectedPokemon.sprites.front_default}" alt="${this.selectedPokemon.name}" />
          <p><strong>Tipos:</strong> ${this.selectedPokemon.types.map(type => type.type.name).join(', ')}</p>
          <p><strong>Habilidades:</strong> ${this.selectedPokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
          <p><strong>Estadísticas:</strong></p>
          <ul>
            ${this.selectedPokemon.stats.map(stat => html`
              <li>${stat.stat.name}: ${stat.base_stat}</li>
            `)}
          </ul>
          <h4>Evoluciones:</h4>
          <ul>
            ${this.selectedPokemonEvolutions.length > 0
              ? this.selectedPokemonEvolutions.map(evolution => html`<li>${evolution}</li>`)
              : html`<li>No se encontraron evoluciones.</li>`
            }
          </ul>
          <button class="close-btn" @click="${this.closeModal}">Cerrar</button>
        </div>
      ` : ''}
    `;
  }
}

customElements.define('pokemon-component', PokemonComponent);
