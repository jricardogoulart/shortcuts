document.addEventListener('DOMContentLoaded', () => {
  // Navegação de seções
  const navbar = document.getElementById('navbar');
  const contents = document.querySelectorAll('.content');

  function showContent(id) {
    contents.forEach(c => c.classList.add('hidden'));
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');
  }

  navbar.addEventListener('click', (e) => {
    const el = e.target;
    if ((el.matches('a, img')) && el.dataset.target) {
      e.preventDefault();
      showContent(el.dataset.target);
    }
  });

  // Seção inicial
  showContent('home');

  // -------- Mesclar PDFs --------
  const pdfForm = document.getElementById("pdfForm");
  if (pdfForm) {
    pdfForm.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const files = document.getElementById("pdfFiles").files;
      if (!files || files.length < 2) {
        alert("Selecione pelo menos 2 PDFs.");
        return;
      }
      const pdfDoc = await PDFLib.PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const doc = await PDFLib.PDFDocument.load(bytes);
        const pages = await pdfDoc.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => pdfDoc.addPage(p));
      }
      const pdfBytes = await pdfDoc.save();
      const uri = URL.createObjectURL(new Blob([pdfBytes], { type: "application/pdf" }));
      document.getElementById("result").innerHTML = `
        <div class="w-full flex justify-center mb-4">
          <a href="${uri}" download="pdf-mesclado.pdf"
            class="inline-flex items-center justify-center font-bold py-2 px-4 rounded-lg shadow-md
                   bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <i class="fa-solid fa-download mr-2"></i>Baixar PDF Mesclado
          </a>
        </div>
        <iframe src="${uri}" class="w-full h-[600px] border rounded-md"></iframe>`;
    });
  }

  // -------- Orçamento --------
  let unidadeSelecionada = "Par";

  document.querySelectorAll("#unidade-group button").forEach(btn => {
    btn.addEventListener("click", () => {
      unidadeSelecionada = btn.dataset.unidade;
      document.querySelectorAll("#unidade-group button")
        .forEach(b => b.classList.remove("bg-blue-600", "text-white", "shadow"));
      btn.classList.add("bg-blue-600", "text-white", "shadow");

      const sufixo = (unidadeSelecionada === "Unidade") ? "estampada" : "estampado";
      document.getElementById("label-unidade").textContent = unidadeSelecionada;
      document.getElementById("doc-valor-par-label").textContent = `Valor por ${unidadeSelecionada} ${sufixo}:`;
    });
  });

  const budgetForm = document.getElementById("budget-form");
  if (budgetForm) {
    budgetForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const silk = document.getElementById("silk").value.trim();
      const cliente = document.getElementById("cliente").value.trim();
      const dataHoje = new Date().toLocaleDateString("pt-BR");

      const mv = parseFloat(document.getElementById("matriz-valor").value) || 0;
      const mq = parseInt(document.getElementById("matriz-qtd").value) || 0;
      const mt = mv * mq;

      const gv = parseFloat(document.getElementById("gravacao-valor").value) || 0;
      const gq = parseInt(document.getElementById("gravacao-qtd").value) || 0;
      const gt = gv * gq;

      const devTotal = mt + gt;
      const vp = parseFloat(document.getElementById("valor-par").value) || 0;

      // Atualiza os campos do documento — só se existirem no HTML
      const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      };

      setText("doc-silk", silk);
      setText("doc-cliente", cliente);
      setText("doc-data", dataHoje);

      setText("doc-matriz-valor", "R$ " + mv.toFixed(2));
      setText("doc-matriz-qtd", mq);
      setText("doc-matriz-total", "R$ " + mt.toFixed(2));

      setText("doc-gravacao-valor", "R$ " + gv.toFixed(2));
      setText("doc-gravacao-qtd", gq);
      setText("doc-gravacao-total", "R$ " + gt.toFixed(2));

      const docDevTotal = document.getElementById("doc-desenvolvimento-total");
      if (docDevTotal) docDevTotal.innerHTML = `<strong>R$ ${devTotal.toFixed(2)}</strong>`;

      setText("doc-valor-par", "R$ " + vp.toFixed(2));

      // Imagem do desenvolvimento
      const fileInput = document.getElementById("imagem-desenvolvimento");
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
          const img = document.getElementById("doc-imagem");
          if (img) img.src = e.target.result;
        };
        reader.readAsDataURL(fileInput.files[0]);
      }

      // Exibe documento e habilita download
      const docSection = document.getElementById("document-section");
      if (docSection) docSection.classList.remove("hidden");

      const downloadBtn = document.getElementById("download-pdf");
      if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.classList.remove("bg-gray-400", "opacity-60", "cursor-not-allowed");
        downloadBtn.classList.add("bg-green-600", "hover:bg-green-700");
      }
    });
  }

  // Download do PDF do orçamento
  const downloadBtn = document.getElementById("download-pdf");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
      const silk = document.getElementById("silk").value.trim().replace(/\s+/g, "_");
      const cliente = document.getElementById("cliente").value.trim().replace(/\s+/g, "_");
      const dataHoje = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
      const fileName = `Orcamento-${silk}(${cliente})-${dataHoje}.pdf`;

      const { jsPDF } = window.jspdf;
      const element = document.getElementById("a4-container");
      if (!element) return alert("Não foi possível gerar o PDF. Verifique o HTML.");

      const canvas = await html2canvas(element, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight, null, "FAST");
      pdf.save(fileName);
    });
  }

  // -------- Funções para Referências --------
  function generateReferences() {
    const input = document.getElementById("referencesInput").value.toUpperCase();
    const lines = input.split("\n");
    let allReferences = "";
    let previousReference = "";

    lines.forEach((line) => {
      const match = line.match(/(.+)\s\((\d+)-(\d+)\)/);
      if (match) {
        const reference = match[1];
        const start = parseInt(match[2]);
        const end = parseInt(match[3]);

        if (start <= end) {
          if (allReferences && previousReference !== reference) {
            allReferences += "\n\n"; // Adiciona duas quebras de linha entre diferentes referências
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
    textarea.value = text.replace(/\n/g, "\r\n"); // Preserva as quebras de linha ao copiar
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    alert("Todas as referências foram copiadas!");
  }
});
