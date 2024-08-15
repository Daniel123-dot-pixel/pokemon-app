import { LitElement, html, css } from 'lit';
import './pokemon-card.js'; 

class PokemonComponent extends LitElement {
  static styles = css`
    .pokemon-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
    .filter-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
      border-radius: 16px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    .filter-controls select, .filter-controls input {
      padding: 10px 12px;
      margin: 10px;
      border-radius: 12px;
      border: 2px solid #007bff;
      background: linear-gradient(135deg, #ffffff 0%, #e9e9f0 100%);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      transition: box-shadow 0.3s ease, transform 0.3s ease;
      font-size: 14px;
      color: #333;
    }
    .filter-controls select:hover, .filter-controls input:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transform: translateY(-3px);
    }
    .filter-controls select {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23333" d="M2 0L0 2h4z"/></svg>');
      background-repeat: no-repeat;
      background-position: right 10px top 50%;
      background-size: 10px;
    }
    .filter-controls select option {
      background: linear-gradient(135deg, #ffffff 0%, #f0f0f5 100%);
      padding: 10px;
      border-radius: 8px;
    }
    .filter-controls select option:hover {
      background-color: #007bff;
      color: #fff;
    }
    .filter-controls label {
      margin-right: 8px;
      font-weight: 500;
      color: #555;
    }
    .filter-controls select:focus, .filter-controls input:focus {
      outline: none;
      border-color: #0056b3;
      box-shadow: 0 0 8px rgba(0, 86, 179, 0.5);
    }
    .filter-controls .input-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 10px;
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
      this.applyFilters();
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

  render() {
    return html`
      <div class="filter-controls">
        <div class="input-group">
          <label for="filter-select">Filtro:</label>
          <select id="filter-select" @change="${this.handleFilterChange}">
            <option value="">Seleccionar filtro</option>
            <option value="type">Tipo</option>
            <option value="name">Nombre</option>
            <option value="sort">Alfabéticamente</option>
          </select>
        </div>

        ${this.selectedFilter === 'type'
          ? html`
              <div class="input-group">
                <label for="type-filter">Tipo:</label>
                <select id="type-filter" @change="${this.handleValueChange}">
                  <option value="">Todos los Tipos</option>
                  ${this.types.map(
                    (type) => html`<option value="${type.name}">${type.name}</option>`
                  )}
                </select>
              </div>
            `
          : this.selectedFilter === 'name'
          ? html`
              <div class="input-group">
                <label for="name-filter">Nombre:</label>
                <input
                  id="name-filter"
                  type="text"
                  placeholder="Buscar Pokémon..."
                  @input="${this.handleValueChange}"
                />
              </div>
            `
          : this.selectedFilter === 'sort'
          ? html`
              <div class="input-group">
                <label for="sort-order">Orden:</label>
                <select id="sort-order" @change="${this.handleSortChange}">
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
                </select>
              </div>
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
                ></pokemon-card>
              `
            )
          : html`<p>No se han encontrado Pokemones con los filtros actuales.</p>`}
      </div>
    `;
  }
}

customElements.define('pokemon-component', PokemonComponent);
