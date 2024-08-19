// scripts.js

// Função para exibir o conteúdo das abas
function showContent(tabName) {
    var contents = document.getElementsByClassName('content');
    for (var i = 0; i < contents.length; i++) {
        contents[i].classList.remove('active');
    }
    document.getElementById(tabName).classList.add('active');
}

// Aba de Referências
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

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('gerarPDF').addEventListener('click', gerarPDF);
});

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(12);

    // Captura dos dados do formulário
    const nomeCliente = document.getElementById('nomeCliente').value;
    const descricao = document.getElementById('descricao').value;
    const qtdMatrizes = parseInt(document.getElementById('qtdMatrizes').value);
    const valorMatriz = parseFloat(document.getElementById('valorMatriz').value);
    const qtdGravacaoFotolito = parseInt(document.getElementById('qtdGravacaoFotolito').value);
    const valorGravacaoFotolito = parseFloat(document.getElementById('valorGravacaoFotolito').value);
    const custoMaoDeObra = parseFloat(document.getElementById('custoMaoDeObra').value);

    const valorTotalMatrizes = qtdMatrizes * valorMatriz;
    const valorTotalGravacaoFotolito = qtdGravacaoFotolito * valorGravacaoFotolito;
    const valorTotal = valorTotalMatrizes + valorTotalGravacaoFotolito;

    // Configurando margens e centralização
    const pageWidth = doc.internal.pageSize.getWidth();
    const startX = (pageWidth - 180) / 2;

    doc.text('Ficha Orçamentária', pageWidth / 2, 20, null, null, 'center');
    doc.setFontSize(11);
    doc.text(`Nome Cliente: ${nomeCliente}`, startX, 40);
    doc.text(`Descrição: ${descricao}  Quantidade De Matrizes: ${qtdMatrizes}`, startX, 50);

    // Configuração da tabela
    doc.autoTable({
        head: [['Item', 'Valor Unitário', 'Quantidade', 'Valor Total']],
        body: [
            ['Matriz Serigráfica', `R$ ${valorMatriz.toFixed(2)}`, `${qtdMatrizes}`, `R$ ${valorTotalMatrizes.toFixed(2)}`],
            ['Gravação + Fotolito', `R$ ${valorGravacaoFotolito.toFixed(2)}`, `${qtdGravacaoFotolito}`, `R$ ${valorTotalGravacaoFotolito.toFixed(2)}`],
        ],
        startY: 60,
        margin: { left: startX },
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0] },
        styles: { halign: 'center' },
    });

    doc.text(`Valor Total Desenvolvimento das Matrizes: R$ ${valorTotal.toFixed(2)}`, startX, doc.autoTable.previous.finalY + 20);
    doc.text(`Custo da Mão de Obra por Unidade: R$ ${custoMaoDeObra.toFixed(2)}`, startX, doc.autoTable.previous.finalY + 30);

    doc.setFontSize(11);
    doc.text(`"Observação: Ao aprovar o orçamento, o cliente é responsável por contribuir com 50% do valor total para o desenvolvimento das matrizes."`, startX, doc.autoTable.previous.finalY + 50);
    doc.text(`50% de R$ ${valorTotal.toFixed(2)} = R$ ${(valorTotal / 2).toFixed(2)}`, startX, doc.autoTable.previous.finalY + 60);

    // Gerando o PDF
    doc.save(`Ficha_Orcamentaria_${nomeCliente}.pdf`);
}


