import { LitElement, html, css } from 'lit';

class PokemonCard extends LitElement {
  static styles = css`
    .card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      max-width: 200px;
      margin: 16px;
      padding: 16px;
      cursor: pointer;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf4 100%);
    }
    .card:hover {
      transform: translateY(-10px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
    .card img {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 50%;
      background: linear-gradient(135deg, #ffffff 0%, #d1e4f7 100%);
      margin-bottom: 12px;
      padding: 8px;
    }
    .card h2 {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      margin: 0;
      padding: 8px 0;
      background: linear-gradient(135deg, #007bff, #00d4ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `;

  static properties = {
    name: { type: String },
    imageUrl: { type: String },
  };

  constructor() {
    super();
    this.name = '';
    this.imageUrl = '';
  }

  handleClick() {
    this.dispatchEvent(new CustomEvent('pokemon-click', {
      detail: { name: this.name },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="card" @click="${this.handleClick}">
        <img src="${this.imageUrl}" alt="${this.name}">
        <h2>${this.name}</h2>
      </div>
    `;
  }
}

customElements.define('pokemon-card', PokemonCard);
