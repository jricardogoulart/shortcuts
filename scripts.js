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

    <button type="button" onclick="gerarPDF()">Gerar PDF</button>

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

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const { nomeCliente, descricao, qtdMatrizes, valorMatriz, qtdGravacaoFotolito, valorGravacaoFotolito, custoMaoDeObra } = getFormData();

    const valorTotalMatrizes = qtdMatrizes * valorMatriz;
    const valorTotalGravacaoFotolito = qtdGravacaoFotolito * valorGravacaoFotolito;
    const valorTotal = valorTotalMatrizes + valorTotalGravacaoFotolito;

    doc.text(`Nome do Cliente: ${nomeCliente}`, 10, 10);
    doc.text(`Descrição: ${descricao}`, 10, 20);
    doc.text(`Valor Total Matrizes: R$ ${valorTotalMatrizes.toFixed(2)}`, 10, 30);
    doc.text(`Valor Total Gravação + Fotolito: R$ ${valorTotalGravacaoFotolito.toFixed(2)}`, 10, 40);
    doc.text(`Valor Total: R$ ${valorTotal.toFixed(2)}`, 10, 50);

    doc.save('orcamento.pdf');
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
