import { LitElement, html, css, property } from 'lit';

class PokemonModal extends LitElement {
  static styles = css`
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      max-width: 500px;
      width: 100%;
      position: relative;
    }
    .modal-content img {
      width: 150px;
      height: 150px;
    }
    .close {
      position: absolute;
      top: 10px;
      right: 10px;
      cursor: pointer;
      font-size: 24px;
    }
  `;

  @property({ type: Object }) pokemon = null;
  @property({ type: Boolean }) open = false;

  render() {
    if (!this.open || !this.pokemon) return html``;

    return html`
      <div class="modal">
        <div class="modal-content">
          <span class="close" @click="${this._closeModal}">&times;</span>
          <h2>${this.pokemon.name}</h2>
          <img src="${this.pokemon.sprites.front_default}" alt="${this.pokemon.name}" />
          <div>
            <h3>Types:</h3>
            <ul>
              ${this.pokemon.types.map(type => html`<li>${type.type.name}</li>`)}
            </ul>
          </div>
          <div>
            <h3>Abilities:</h3>
            <ul>
              ${this.pokemon.abilities.map(ability => html`<li>${ability.ability.name}</li>`)}
            </ul>
          </div>
          <div>
            <h3>Stats:</h3>
            <ul>
              ${this.pokemon.stats.map(stat => html`
                <li>${stat.stat.name}: ${stat.base_stat}</li>
              `)}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  _closeModal() {
    this.dispatchEvent(new CustomEvent('modal-closed'));
  }
}

customElements.define('pokemon-modal', PokemonModal);
