// Máscaras de digitação (v1.1 — relato de teste 2). Funções puras, testadas no Node.

const digitos = (valor, maximo) => String(valor ?? '').replace(/\D/g, '').slice(0, maximo);

/** 01310100 → 01310-100 */
export function mascararCep(valor) {
  const d = digitos(valor, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** 11987654321 → (11) 98765-4321 · 1133334444 → (11) 3333-4444 */
export function mascararTelefone(valor) {
  const d = digitos(valor, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  const ddd = d.slice(0, 2);
  const numero = d.slice(2);
  if (numero.length <= 4) return `(${ddd}) ${numero}`;
  const corte = numero.length === 9 ? 5 : 4;
  return `(${ddd}) ${numero.slice(0, corte)}-${numero.slice(corte)}`;
}

/** Liga uma máscara a um campo de formulário (somente no navegador). */
export function aplicarMascara(campo, mascara) {
  if (!campo) return;
  const formatar = () => { campo.value = mascara(campo.value); };
  campo.addEventListener('input', formatar);
  formatar();
}
