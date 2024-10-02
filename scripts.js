// Função para mostrar a seção correta
function showContent(contentId) {
    // Esconde todas as seções
    const contents = document.querySelectorAll('.content');
    contents.forEach(content => {
        content.classList.remove('active');
    });

    // Mostra a seção selecionada
    const selectedContent = document.getElementById(contentId);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
}

// Funções para Referências
function generateReferences() {
    const input = document.getElementById("referencesInput").value.toUpperCase();
    const lines = input.split("\n");
    let allReferences = '';
    let previousReference = '';

    lines.forEach(line => {
        const match = line.match(/(.+)\s\((\d+)-(\d+)\)/);
        if (match) {
            const reference = match[1];
            const start = parseInt(match[2]);
            const end = parseInt(match[3]);

            if (start <= end) {
                if (allReferences && previousReference !== reference) {
                    allReferences += '\n\n'; // Adiciona duas quebras de linha entre diferentes referências
                }

                for (let i = start; i <= end; i++) {
                    allReferences += `${reference} - ${i}\n`;
                }

                previousReference = reference;
            }
        }
    });

    document.getElementById("output").textContent = allReferences.trim();
}

function copyToClipboard() {
    const text = document.getElementById("output").textContent;
    const textarea = document.createElement("textarea");
    textarea.value = text.replace(/\n/g, '\r\n'); // Preserva as quebras de linha ao copiar
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    alert("Todas as referências foram copiadas!");
}

// Capturar parâmetros do formulário e gerar PDF para orçamentos
function getFormData() {
  return {
      nomeCliente: document.getElementById('nomeCliente').value,
      data: document.getElementById('data').value,  // Corrigido para capturar o valor da data
      descricao: document.getElementById('descricao').value,
      qtdMatrizes: parseInt(document.getElementById('qtdMatrizes').value),
      valorMatriz: parseFloat(document.getElementById('valorMatriz').value),
      qtdGravacaoFotolito: parseInt(document.getElementById('qtdGravacaoFotolito').value),
      valorGravacaoFotolito: parseFloat(document.getElementById('valorGravacaoFotolito').value),
      custoMaoDeObra: parseFloat(document.getElementById('custoMaoDeObra').value)
  };
}

function exibirOrcamento() {
  const { nomeCliente, data, descricao, qtdMatrizes, valorMatriz, qtdGravacaoFotolito, valorGravacaoFotolito, custoMaoDeObra } = getFormData();

  const valorTotalMatrizes = qtdMatrizes * valorMatriz;
  const valorTotalGravacaoFotolito = qtdGravacaoFotolito * valorGravacaoFotolito;
  const valorTotal = valorTotalMatrizes + valorTotalGravacaoFotolito;

  const detalhesOrcamento = `
  <div class="ficha-orc-container">
      <h1 class="ficha-orc-title">Ficha Orçamentária</h1>
      
      <p class="ficha-orc-text">
        <strong class="ficha-orc-strong">Nome do Cliente:</strong> ${nomeCliente} 
        <strong class="ficha-orc-strong">Data:</strong> ${new Date(data).toLocaleDateString()}
      </p>
      
      <p class="ficha-orc-text">
        <strong class="ficha-orc-strong">Descrição:</strong> ${descricao}
      </p>
      
      <table class="ficha-orc-table">
        <thead>
          <tr>
            <th class="ficha-orc-th">Item</th>
            <th class="ficha-orc-th">Valor Unitário</th>
            <th class="ficha-orc-th">Quantidade</th>
            <th class="ficha-orc-th">Valor Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="ficha-orc-td">Matriz Serigráfica</td>
            <td class="ficha-orc-td">R$ ${valorMatriz.toFixed(2)}</td>
            <td class="ficha-orc-td">${qtdMatrizes}</td>
            <td class="ficha-orc-td">R$ ${valorTotalMatrizes.toFixed(2)}</td>
          </tr>
          <tr>
            <td class="ficha-orc-td">Gravação + Fotolito</td>
            <td class="ficha-orc-td">R$ ${valorGravacaoFotolito.toFixed(2)}</td>
            <td class="ficha-orc-td">${qtdGravacaoFotolito}</td>
            <td class="ficha-orc-td">R$ ${valorTotalGravacaoFotolito.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <p class="ficha-orc-text">
        <strong class="ficha-orc-strong">Valor Total Matrizes:</strong> R$ ${valorTotalMatrizes.toFixed(2)}
      </p>
      
      <p class="ficha-orc-text">
        <strong class="ficha-orc-strong">Valor Total Gravação + Fotolito:</strong> R$ ${valorTotalGravacaoFotolito.toFixed(2)}
      </p>
      
      <p class="ficha-orc-text">
        <strong class="ficha-orc-strong">Custo de Mão de Obra:</strong> R$ ${custoMaoDeObra}
      </p>
      
      <p class="ficha-orc-total">
        <strong class="ficha-orc-strong">Valor Total:</strong> R$ ${valorTotal.toFixed(2)}
      </p>
  </div>
  `;

  document.getElementById('orcamentoDetalhes').innerHTML = detalhesOrcamento;
}

function gerarPDF() {
  const { jsPDF } = window.jspdf;

  const orcamentoDetalhes = document.getElementById('orcamentoDetalhes');
  const nomeCliente = document.getElementById('nomeCliente').value;
  const data = document.getElementById('data').value;
  const dataFormatada = new Date(data).toLocaleDateString();

  // Usando html2canvas para capturar o HTML
  html2canvas(orcamentoDetalhes, { scale: 2 }).then(function (canvas) {
      const imgData = canvas.toDataURL('image/png', 1.0); // Qualidade 1.0 para máxima

      const imgWidth = 190; // Largura da imagem no PDF
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Altura proporcional

      const doc = new jsPDF();
      doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

      // Salva o PDF com nome customizado
      doc.save(`Orcamento_${nomeCliente}_${dataFormatada}.pdf`);
  }).catch(function (error) {
      console.error('Erro ao gerar o PDF:', error);
  });
}

// Mesclagem de PDFs
document.getElementById('pdfForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const files = document.getElementById('pdfFiles').files;
    const pdfDoc = await PDFLib.PDFDocument.create();

    for (const file of files) {
        const fileArrayBuffer = await file.arrayBuffer();
        const existingPdfDoc = await PDFLib.PDFDocument.load(fileArrayBuffer);
        const copiedPages = await pdfDoc.copyPages(existingPdfDoc, existingPdfDoc.getPageIndices());
        copiedPages.forEach(page => pdfDoc.addPage(page));
    }

    const pdfBytes = await pdfDoc.save();
    
    // Exibindo o PDF mesclado na tela
    const pdfOutput = document.getElementById('result');
    pdfOutput.innerHTML = "";
    
    const pdfDataUri = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
    const iframe = document.createElement('iframe');
    iframe.src = pdfDataUri;
    iframe.width = "100%";
    iframe.height = "1200px";
    
    pdfOutput.appendChild(iframe);

    // Adicionando o botão de download abaixo do PDF mesclado
    const downloadButton = document.createElement('button');
    downloadButton.innerText = "Baixar PDF Mesclado";
    downloadButton.onclick = function() {
        const link = document.createElement('a');
        link.href = pdfDataUri;
        link.download = 'pdf-mesclado.pdf';
        link.click();
    };
    
    pdfOutput.appendChild(downloadButton);
});

// Inicializa a seção inicial (por exemplo, Referências)
document.querySelector('.navbar a').classList.add('active');
showContent('referencias');


// Clientes
document.addEventListener('DOMContentLoaded', function(){
  let clientes = [];

// Função para buscar o endereço pelo CEP utilizando a API do ViaCEP
function buscarEndereco(cep) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (!data.erro) {
                document.getElementById('endereco').value = data.logradouro;
            } else {
                alert('CEP não encontrado!');
                document.getElementById('endereco').value = '';
            }
        })
        .catch(error => console.error('Erro ao buscar endereço:', error));
}

// Quando o usuário sair do campo de CEP, buscar o endereço
document.getElementById('cep').addEventListener('blur', function() {
    const cep = this.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cep.length === 8) { // Verifica se o CEP tem 8 dígitos
        buscarEndereco(cep);
    } else {
        alert('CEP inválido!');
    }
});

// Função para criar e exibir os cards dos clientes
function criarCards(clientes) {
    const clientesContainer = document.getElementById('clientes');
    clientesContainer.innerHTML = ''; // Limpar os cards anteriores

    clientes.forEach(cliente => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <h3>${cliente.nome}</h3>
            <p><strong>Telefone:</strong> ${cliente.telefone}</p>
            <p><strong>CNPJ:</strong> ${cliente.cnpj}</p>
            <p><strong>CEP:</strong> ${cliente.cep}</p>
            <p><strong>Endereço:</strong> ${cliente.endereco}, ${cliente.numero}</p>
        `;
        clientesContainer.appendChild(card);
    });
}

// Função para baixar o JSON dos clientes
function downloadJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clientes));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "clientes.json");
    document.body.appendChild(downloadAnchorNode); // Required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Função para carregar um JSON de clientes
function carregarClientes(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            clientes = JSON.parse(e.target.result);
            criarCards(clientes); // Atualizar os cards com os clientes carregados
        };
        reader.readAsText(file);
    }
}

// Evento para o botão de download do JSON
document.getElementById('downloadJson').addEventListener('click', downloadJSON);

// Evento para upload do JSON
document.getElementById('uploadJson').addEventListener('change', carregarClientes);

// Evento de envio do formulário para cadastrar cliente
document.getElementById('formCliente').addEventListener('submit', function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const cnpj = document.getElementById('cnpj').value;
    const cep = document.getElementById('cep').value;
    const numero = document.getElementById('numero').value;
    const endereco = document.getElementById('endereco').value;

    const novoCliente = {
        nome,
        telefone,
        cnpj,
        cep,
        endereco,
        numero
    };

    clientes.push(novoCliente); // Adiciona o cliente à lista
    criarCards(clientes); // Atualiza os cards
    this.reset(); // Limpa o formulário
});
}) 
