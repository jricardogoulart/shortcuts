// scripts.js



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

// Capturar parâmetros do formulário

function getFormData() {
    return {
        nomeCliente: document.getElementById('nomeCliente').value,
        descricao: document.getElementById('descricao').value,
        qtdMatrizes: parseInt(document.getElementById('qtdMatrizes').value),
        valorMatriz: parseFloat(document.getElementById('valorMatriz').value),
        qtdGravacaoFotolito: parseInt(document.getElementById('qtdGravacaoFotolito').value),
        valorGravacaoFotolito: parseFloat(document.getElementById('valorGravacaoFotolito').value),
        custoMaoDeObra: parseFloat(document.getElementById('custoMaoDeObra').value)
    };
}

function exibirOrcamento() {
    const { nomeCliente, descricao, qtdMatrizes, valorMatriz, qtdGravacaoFotolito, valorGravacaoFotolito, custoMaoDeObra } = getFormData();

    const valorTotalMatrizes = qtdMatrizes * valorMatriz;
    const valorTotalGravacaoFotolito = qtdGravacaoFotolito * valorGravacaoFotolito;
    const valorTotal = valorTotalMatrizes + valorTotalGravacaoFotolito;

    const detalhesOrcamento = `
        <p><strong>Nome do Cliente:</strong> ${nomeCliente}</p>
        <p><strong>Descrição:</strong> ${descricao}</p>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Valor Unitário</th>
                    <th>Quantidade</th>
                    <th>Valor Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Matriz Serigráfica</td>
                    <td>R$ ${valorMatriz.toFixed(2)}</td>
                    <td>${qtdMatrizes}</td>
                    <td>R$ ${valorTotalMatrizes.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Gravação + Fotolito</td>
                    <td>R$ ${valorGravacaoFotolito.toFixed(2)}</td>
                    <td>${qtdGravacaoFotolito}</td>
                    <td>R$ ${valorTotalGravacaoFotolito.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
        <p><strong>Valor Total Matrizes:</strong> R$ ${valorTotalMatrizes.toFixed(2)}</p>
        <p><strong>Valor Total Gravação + Fotolito:</strong> R$ ${valorTotalGravacaoFotolito.toFixed(2)}</p>
        <p><strong>Valor Total:</strong> R$ ${valorTotal.toFixed(2)}</p>
    `;

    document.getElementById('orcamentoDetalhes').innerHTML = detalhesOrcamento;
}

document.getElementById('gerarPDF').addEventListener('click', function() {
    exibirOrcamento();
    gerarPDF();
});
function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

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

    // Configurando o PDF
    doc.setFontSize(16);
    const pageWidth = doc.internal.pageSize.getWidth();
    const startX = (pageWidth - 180) / 2;

    doc.text('Ficha Orçamentária', pageWidth / 2, 20, null, null, 'center');
    doc.setFontSize(11);
    doc.text(`Nome Cliente: ${nomeCliente}`, startX, 40);
    doc.text(`Descrição: ${descricao}`, startX, 50);
    doc.text(`Quantidade De Matrizes: ${qtdMatrizes}`, startX, 60);

    doc.autoTable({
        head: [['Item', 'Valor Unitário', 'Quantidade', 'Valor Total']],
        body: [
            ['Matriz Serigráfica', `R$ ${valorMatriz.toFixed(2)}`, `${qtdMatrizes}`, `R$ ${valorTotalMatrizes.toFixed(2)}`],
            ['Gravação + Fotolito', `R$ ${valorGravacaoFotolito.toFixed(2)}`, `${qtdGravacaoFotolito}`, `R$ ${valorTotalGravacaoFotolito.toFixed(2)}`],
        ],
        startY: 70,
        margin: { left: startX },
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0] },
        styles: { halign: 'center' },
    });

    doc.text(`Valor Total Desenvolvimento das Matrizes: R$ ${valorTotal.toFixed(2)}`, startX, doc.autoTable.previous.finalY + 20);
    doc.text(`Custo da Mão de Obra por Unidade: R$ ${custoMaoDeObra.toFixed(2)}`, startX, doc.autoTable.previous.finalY + 30);

    doc.setFontSize(11);
    doc.text(`"Observação: Ao aprovar o orçamento, o cliente é responsável por contribuir com \n 50% do valor total para o desenvolvimento das matrizes."`, startX, doc.autoTable.previous.finalY + 50);
    doc.text(`50% de R$ ${valorTotal.toFixed(2)} = R$ ${(valorTotal / 2).toFixed(2)}`, startX, doc.autoTable.previous.finalY + 60);

    // Exibindo o PDF gerado na tela
    const pdfOutput = document.getElementById('pdfOutput');
    pdfOutput.innerHTML = "";
    
    const pdfDataUri = doc.output('datauristring');
    const iframe = document.createElement('iframe');
    iframe.src = pdfDataUri;
    iframe.width = "100%";
    iframe.height = "1200px";
    
    pdfOutput.appendChild(iframe);

    // Adicionando o botão de download abaixo do PDF gerado
    const downloadButton = document.createElement('button');
    downloadButton.innerText = "Baixar PDF";
    downloadButton.onclick = function() {
        doc.save(`Ficha Orcamentaria ${nomeCliente}.pdf`);
    };
    
    pdfOutput.appendChild(downloadButton);
}

// Função para alternar a exibição das abas
function showContent(tabName) {
    const contents = document.querySelectorAll('.content');
    contents.forEach(content => content.classList.remove('active'));

    const activeContent = document.getElementById(tabName);
    activeContent.classList.add('active');
}
