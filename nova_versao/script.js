//criação das variáveis para a criação da tela
const linhas = 6;
const colunas = 12;
const cores = ['black', 'red', 'green', 'blue'];

let tabuleiro =[];

const container = document.getElementById('tabuleiro');

//montando as funções
//Função para criar o tabuleiro
function criarTabuleiro(){
    tabuleiro = [];
    container.innerHTML = '';
    for(let i = 0; i<linhas; i++){
        const linha = [];
        for(let j = 0; j < colunas; j++){
            const cor = cores[Math.floor(Math.random() * cores.length)];
            linha.push(cor);
            criarCelulas(i, j, cor);
        }
        tabuleiro.push(linha);
    }
}

//Função para criar as celulas
function criarCelulas(i, j, cor){
    const div = document.createElement('div');
    div.className = 'bloco';
    div.style.backgroundColor = cor;
    div.dataset.linha = i;
    div.dataset.coluna = j;
    container.appendChild(div);
}

let selecionarBloco = null;

//Adicionando evento no container

container.addEventListener('click', (e)=>{
    const alvo = e.target;
    if(!alvo.classList.contains('bloco')) return;

    const i = parseInt(alvo.dataset.linha);
    const j = parseInt(alvo.dataset.coluna);

    if(!selecionarBloco){
        selecionarBloco = {i, j};
        alvo.classList.add('selecionado');
    }else{
        const {i: i2, j: j2} = selecionarBloco;
        const blocoAnterior = container.querySelector(`[data-linha = '${i2}'][data-coluna ='${j2}']`);
        blocoAnterior.classList.remove('selecionado');
        if ((Math.abs(i - i2) === 1 && j === j2) || (Math.abs(j - j2) === 1 && i === i2)) {
            trocarBlocos(i, j, i2, j2);
            setTimeout(verificarExplosoes, 200);
            selecionarBloco = null;
          }
    }
});

function trocarBlocos(i1, j1, i2, j2) {
    [grade[i1][j1], grade[i2][j2]] = [grade[i2][j2], grade[i1][j1]];
  
    const bloco1 = container.querySelector(`[data-linha='${i1}'][data-coluna='${j1}']`);
    const bloco2 = container.querySelector(`[data-linha='${i2}'][data-coluna='${j2}']`);
  
    const cor1 = tabuleiro[i1][j1];
    const cor2 = tabuleiro[i2][j2];
  
    bloco1.style.backgroundColor = cor1;
    bloco2.style.backgroundColor = cor2;
  }

  function verificarExplosoes() {
    const combos = encontrarCombos();
    if (combos.length === 0) return;
  
    combos.forEach(({ linha, coluna }) => {
      const cor = tabuleiro[linha][coluna];
      criarParticulasExplosao(linha, coluna, cor);
      tabuleiro[linha][coluna] = null;
    });
  
    atualizarGrade();
    setTimeout(preencherNovos, 200);
    setTimeout(verificarExplosoes, 400);
  }
  function encontrarCombos() {
    let encontrados = [];
  
    // Horizontais
    for (let i = 0; i < linhas; i++) {
      let corAtual = tabuleiro[i][0];
      let inicio = 0;
      for (let j = 1; j <= colunas; j++) {
        if (j < colunas && grade[i][j] === corAtual && corAtual !== null) continue;
        if (j - inicio >= 3 && corAtual !== null) {
          for (let k = inicio; k < j; k++) {
            encontrados.push({ linha: i, coluna: k });
          }
        }
        corAtual = j < colunas ? grade[i][j] : null;
        inicio = j;
      }
    }
  
    // Verticais
    for (let j = 0; j < colunas; j++) {
      let corAtual = grade[0][j];
      let inicio = 0;
      for (let i = 1; i <= linhas; i++) {
        if (i < linhas && grade[i][j] === corAtual && corAtual !== null) continue;
        if (i - inicio >= 3 && corAtual !== null) {
          for (let k = inicio; k < i; k++) {
            encontrados.push({ linha: k, coluna: j });
          }
        }
        corAtual = i < linhas ? grade[i][j] : null;
        inicio = i;
      }
    }
  
    return encontrados;
  }
  
  function atualizarGrade() {
    for (let j = 0; j < colunas; j++) {
      for (let i = linhas - 1; i >= 0; i--) {
        if (tabuleiro[i][j] === null) {
          for (let k = i - 1; k >= 0; k--) {
            if (tabuleiro[k][j] !== null) {
              tabuleiro[i][j] = tabuleiro[k][j];
              tabuleiro[k][j] = null;
              break;
            }
          }
        }
      }
    }
  
    container.querySelectorAll('.bloco').forEach(bloco => {
      const i = parseInt(bloco.dataset.linha);
      const j = parseInt(bloco.dataset.coluna);
      const cor = tabuleiro[i][j];
      bloco.style.backgroundColor = cor || 'transparent';
    });
  }
  
  function preencherNovos() {
    for (let j = 0; j < colunas; j++) {
      for (let i = 0; i < linhas; i++) {
        if (tabuleiro[i][j] === null) {
          const novaCor = cores[Math.floor(Math.random() * cores.length)];
          tabuleiro[i][j] = novaCor;
  
          const bloco = container.querySelector(`[data-linha='${i}'][data-coluna='${j}']`);
          bloco.style.backgroundColor = novaCor;
        }
      }
    }
  }
  
  function criarParticulasExplosao(linha, coluna, cor) {
    const celula = container.querySelector(`[data-linha='${linha}'][data-coluna='${coluna}']`);
    const { left, top, width, height } = celula.getBoundingClientRect();
  
    for (let i = 0; i < 12; i++) {
      const particula = document.createElement('div');
      particula.classList.add('particula');
      particula.style.backgroundColor = cor;
      particula.style.left = `${left + width / 2}px`;
      particula.style.top = `${top + height / 2}px`;
  
      const angulo = Math.random() * 2 * Math.PI;
      const distancia = Math.random() * 80 + 20;
      const destinoX = Math.cos(angulo) * distancia;
      const destinoY = Math.sin(angulo) * distancia;
  
      particula.animate([
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${destinoX}px, ${destinoY}px)`, opacity: 0 }
      ], {
        duration: 700,
        easing: 'ease-out'
      });
  
      document.body.appendChild(particula);
      setTimeout(() => particula.remove(), 700);
    }
  }
  

criarTabuleiro();
