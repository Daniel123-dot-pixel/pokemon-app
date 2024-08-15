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
    selectedPokemonName: { type: String },
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
    this.selectedPokemonName = '';
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

  async fetchPokemons() {
    try {
      this.loading = true;
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=152');
      const data = await response.json();
      
      const pokemonDetailsPromises = data.results.map(pokemon =>
        fetch(pokemon.url).then(res => res.json())
      );

      const pokemonDetails = await Promise.all(pokemonDetailsPromises);
      this.pokemons = pokemonDetails;

      // Ensure applyFilters is defined and available
      if (typeof this.applyFilters === 'function') {
        this.applyFilters();
      } else {
        console.error('applyFilters is not a function');
      }
    } catch (error) {
      console.error('Error al obtener la lista de Pokemones:', error);
      this.error = 'Error al cargar la lista de Pokemones.';
    } finally {
      this.loading = false;
    }
  }

  applyFilters() {
    let filtered = this.pokemons;

    switch (this.selectedFilter) {
      case 'type':
        if (this.filterValue) {
          filtered = filtered.filter(pokemon =>
            pokemon.types.some(pokemonType => pokemonType.type.name === this.filterValue)
          );
        }
        break;
      case 'name':
        if (this.filterValue) {
          filtered = filtered.filter(pokemon =>
            pokemon.name.toLowerCase().includes(this.filterValue.toLowerCase())
          );
        }
        break;
      case 'sort':
        filtered.sort((a, b) => {
          if (this.sortOrder === 'asc') {
            return a.name.localeCompare(b.name);
          } else {
            return b.name.localeCompare(a.name);
          }
        });
        break;
    }

    this.filteredPokemons = filtered;
  }

  async handlePokemonClick(event) {
    const pokemonName = event.detail.name;
    this.selectedPokemonName = pokemonName;
    await this.fetchEvolutions(pokemonName);
    this.showModal = true;
  }

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

  closeModal() {
    this.showModal = false;
  }

  render() {
    return html`
      <div class="filter-controls">
        <label for="filter-select">Filter:</label>
        <select id="filter-select" @change="${this.handleFilterChange}">
          <option value="">Select Filter</option>
          <option value="type">Tipo</option>
          <option value="name">Nombre</option>
          <option value="sort">Alfabéticamente</option>
        </select>

        ${this.selectedFilter === 'type'
          ? html`
              <label for="type-filter">Type:</label>
              <select id="type-filter" @change="${this.handleValueChange}">
                <option value="">Todos los Tipos</option>
                ${this.types.map(
                  (type) => html`<option value="${type.name}">${type.name}</option>`
                )}
              </select>
            `
          : this.selectedFilter === 'name'
          ? html`
              <label for="name-filter">Name:</label>
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

      ${this.showModal ? html`
        <div class="modal-overlay" @click="${this.closeModal}"></div>
        <div class="modal">
          <h3>Evoluciones de ${this.selectedPokemonName}</h3>
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
