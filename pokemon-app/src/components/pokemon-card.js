//Componente que muestra nombre e imagen del pokemón
import { LitElement, html, css } from 'lit';

class PokemonCard extends LitElement {
  static styles = css`
    .pokemon-card {
      border: 1px solid #ccc;
      padding: 16px;
      margin: 16px;
      border-radius: 8px;
      text-align: center;
      background-color: #f7f7f7;
      width: 150px;
      cursor: pointer;
    }
    .pokemon-image {
      width: 100px;
      height: 100px;
      object-fit: cover;
    }
  `;

  static properties = {
    name: { type: String },
    imageUrl: { type: String },
    pokemonData: { type: Object },
  };

  render() {
    return html`
      <div class="pokemon-card" @click="${this._handleClick}">
        <h3>${this.name}</h3>
        <img
          class="pokemon-image"
          src="${this.imageUrl}"
          alt="${this.name}"
        />
      </div>
    `;
  }

  _handleClick() {
    this.dispatchEvent(new CustomEvent('pokemon-selected', { detail: this.pokemonData }));
  }
}

customElements.define('pokemon-card', PokemonCard);
