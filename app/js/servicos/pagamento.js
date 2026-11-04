// Serviço de pagamento DEMONSTRATIVO (RN11): nenhuma transação real é feita
// e nenhum dado de cartão é solicitado ou armazenado.

export const FORMAS_PAGAMENTO = {
  PIX: 'Pix (simulado)',
  CARTAO: 'Cartão na entrega/retirada',
  DINHEIRO: 'Dinheiro na entrega/retirada',
};

/**
 * Pix é "aprovado" imediatamente na simulação; cartão e dinheiro
 * ficam pendentes até o pagamento presencial.
 */
export function simularPagamento(forma, valorCentavos) {
  if (!Object.hasOwn(FORMAS_PAGAMENTO, forma)) {
    return { aprovado: false, status: 'RECUSADO', motivo: 'Forma de pagamento inválida.' };
  }
  if (!Number.isInteger(valorCentavos) || valorCentavos <= 0) {
    return { aprovado: false, status: 'RECUSADO', motivo: 'Valor inválido.' };
  }
  return { aprovado: true, status: forma === 'PIX' ? 'APROVADO' : 'PENDENTE' };
}
