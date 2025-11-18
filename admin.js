// ========================================================
// ⚙️ CONFIGURAÇÃO
// ========================================================

const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbw25mbSP6E1kpFtV0tMy0Y3IMHoUw9_oTu79oOeDqwfDSse5SklzEi3JxPlevsRh5BDsg/exec'; 
const CLIENTE_URL = 'https://olxltda.github.io/OLX/'; 

// ========================================================

const form = document.getElementById('adminForm');
const modal = document.getElementById('modalSuccess');
const linkDisplay = document.getElementById('finalLink');
const btnSalvar = document.getElementById('btnSalvar');
const btnCopy = document.getElementById('btnCopy');
const btnView = document.getElementById('btnView');
const inputLinkPagamento = document.getElementById('linkPagamento');

// --- 1. LÓGICA DE MÁSCARA DE MOEDA (R$) ---
const moneyInputs = document.querySelectorAll('.money');

const formatMoney = (value) => {
  // Remove tudo que não é dígito
  value = value.replace(/\D/g, "");
  // Converte para float (centavos)
  const amount = parseFloat(value) / 100;
  // Se for NaN (vazio), retorna vazio ou zero formatado
  if (isNaN(amount)) return "";
  
  // Formata BRL
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

moneyInputs.forEach(input => {
  // Evento ao digitar
  input.addEventListener('input', (e) => {
    e.target.value = formatMoney(e.target.value);
  });

  // Formatação inicial caso já tenha valor no HTML
  if(input.value) {
    const cleanVal = input.value.replace(/\D/g, "");
    if(cleanVal) input.value = formatMoney(cleanVal);
  }
});

// --- 2. RECUPERAR ÚLTIMO LINK DA PLANILHA (Sem Cache Local) ---
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Chama o backend pedindo a ação específica
    const res = await fetch(`${BACKEND_URL}?action=getLastLink`);
    const json = await res.json();
    
    if(json.status === 'success' && json.link) {
      inputLinkPagamento.value = json.link;
    } else {
      inputLinkPagamento.placeholder = "Nenhum link anterior encontrado";
    }
  } catch(e) {
    console.error("Erro ao buscar ultimo link", e);
    inputLinkPagamento.placeholder = "Erro ao carregar link (Verifique conexão)";
  }
});

// --- 3. ENVIO DO FORMULÁRIO ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  btnSalvar.textContent = "Processando...";
  btnSalvar.disabled = true;

  const data = {};
  new FormData(form).forEach((v, k) => data[k] = v);

  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      redirect: 'follow', 
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    });
    
    const json = await res.json();

    if (json.status === 'success') {
      const linkPronto = `${CLIENTE_URL}?id=${json.id}`;
      
      // Atualiza interface do Modal
      linkDisplay.textContent = linkPronto;
      btnView.href = linkPronto; // Atualiza o link do botão "Visualizar"
      
      modal.classList.add('active');
    } else {
      alert('Erro do Servidor: ' + json.message);
    }

  } catch (err) {
    console.error(err);
    alert('Erro de conexão ou permissão!');
  } finally {
    btnSalvar.textContent = "Gerar Link do Cliente";
    btnSalvar.disabled = false;
  }
});

// --- 4. BOTÃO COPIAR ---
btnCopy.addEventListener('click', () => {
  navigator.clipboard.writeText(linkDisplay.textContent);
  const originalHTML = btnCopy.innerHTML;
  
  // Feedback visual
  btnCopy.innerHTML = `<i class="fa-solid fa-check"></i> Copiado!`;
  btnCopy.style.background = "#4CAF50";
  
  setTimeout(() => {
    btnCopy.innerHTML = originalHTML;
    btnCopy.style.background = "#fff";
  }, 2000);
});
