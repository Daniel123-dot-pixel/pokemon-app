import { LitElement, html, css } from 'lit';
import './pokemon-card.js'; // import de 

class PokemonComponent extends LitElement {
  static styles = css`
    .pokemon-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
    .filter-controls {
      text-align: center;
      margin-bottom: 16px;
    }
    .filter-controls select, .filter-controls input {
      padding: 8px;
      margin-right: 8px;
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
      console.error('Error fetching Pokémon types:', error);
      this.error = 'Failed to load Pokémon types.';
    }
  }

  async fetchPokemons() {
    try {
      this.loading = true;
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
      const data = await response.json();
      
      const pokemonDetailsPromises = data.results.map(pokemon =>
        fetch(pokemon.url).then(res => res.json())
      );

      const pokemonDetails = await Promise.all(pokemonDetailsPromises);
      this.pokemons = pokemonDetails;
      this.applyFilters();
    } catch (error) {
      console.error('Error fetching Pokémon list:', error);
      this.error = 'Failed to load Pokémon list.';
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
        <label for="filter-select">Filter:</label>
        <select id="filter-select" @change="${this.handleFilterChange}">
          <option value="">Select Filter</option>
          <option value="type">Filter by Type</option>
          <option value="name">Filter by Name</option>
          <option value="sort">Sort Alphabetically</option>
        </select>

        ${this.selectedFilter === 'type'
          ? html`
              <label for="type-filter">Type:</label>
              <select id="type-filter" @change="${this.handleValueChange}">
                <option value="">All Types</option>
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
                placeholder="Search Pokémon..."
                @input="${this.handleValueChange}"
              />
            `
          : this.selectedFilter === 'sort'
          ? html`
              <label for="sort-order">Sort Order:</label>
              <select id="sort-order" @change="${this.handleSortChange}">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            `
          : html``
        }
      </div>

      <div class="pokemon-list">
        ${this.loading
          ? html`<p>Loading Pokémon list...</p>`
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
          : html`<p>No Pokémon found with the current filters.</p>`}
      </div>
    `;
  }
}

customElements.define('pokemon-component', PokemonComponent);
