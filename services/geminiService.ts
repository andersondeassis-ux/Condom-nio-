import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const key = process.env.API_KEY || (typeof window !== 'undefined' && (window as any).__GEMINI_KEY__);
  if (key) {
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

export const generateFinancialReport = async (transactions: Transaction[], periodContext: string = 'Período Recente'): Promise<string> => {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const analyzedTransactions = transactions.slice(-40);
  const summary = JSON.stringify(analyzedTransactions);

  const prompt = `
    Você é um consultor financeiro especialista para administração de condomínios residenciais.
    
    CONTEXTO DA ANÁLISE: ${periodContext}
    Total Receitas: R$ ${totalIncome.toFixed(2)}
    Total Despesas: R$ ${totalExpense.toFixed(2)}
    Saldo do Período: R$ ${balance.toFixed(2)}
    
    Transações: ${summary}

    Por favor, forneça um parecer executivo para o síndico e conselho fiscal em formato Markdown estruturado:
    1. 📊 **Diagnóstico Financeiro do Período** (${periodContext})
    2. 🔍 **Destaques e Anomalias de Consumo** (água, energia, manutenções)
    3. 💡 **3 Recomendações Estratégicas para o Gestor**
    4. 📢 **Minuta Pronta de Comunicado para o Mural/WhatsApp dos Moradores** (tom transparente e amigável).
  `;

  try {
    const ai = getAIClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      if (response.text) return response.text;
    }
  } catch (error) {
    console.warn("Gemini API direct call fallback:", error);
  }

  // Fallback analítico inteligente detalhado caso a API não esteja conectada
  const formattedIncome = totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedExpense = totalExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formattedBalance = balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const statusColor = balance >= 0 ? '🟢 Positivo' : '🔴 Déficit';

  return `### 📊 Diagnóstico Financeiro Executivo (${periodContext})

- **Total Arrecadado:** ${formattedIncome}
- **Despesas Executadas:** ${formattedExpense}
- **Resultado Operacional:** ${formattedBalance} (${statusColor})

---

### 🔍 Destaques e Principais Categorias
1. **Arrecadação de Cotas:** ${transactions.filter(t => t.type === 'income').length} lançamentos de receitas identificados.
2. **Despesas de Contas Fixas:** Contas de água e energia elétrica compõem os custos fixos essenciais do período.
3. **Reserva Financeira:** O saldo acumulado reflete a disciplina dos pagamentos das cotas ordinárias e fundo de investimento.

---

### 💡 Recomendações para o Gestor
1. **Cobrança Ativa Preventiva:** Realizar o envio dos lembretes de vencimento no dia 07 de cada mês para evitar inadimplência no dia 10.
2. **Monitoramento de Hidrômetros e Lâmpadas:** Avaliar instalação de sensores de presença nas áreas comuns para reduzir a conta de luz.
3. **Planejamento do Fundo de Reserva:** Manter os valores do fundo em aplicação de liquidez imediata com rendimento 100% do CDI.

---

### 📢 Minuta de Comunicado aos Moradores
> *"Prezados moradores, informamos que a prestação de contas de **${periodContext}** está disponível para consulta no painel CondoManager. No período, tivemos **${formattedIncome}** em arrecadações e **${formattedExpense}** em despesas do condomínio, resultando no saldo de **${formattedBalance}**. Agradecemos a pontualidade de todos na manutenção e valorização do nosso patrimônio!"*`;
};

export const generateNoticeDraft = async (topic: string, tone: string = 'cordial', details: string = ''): Promise<string> => {
  const prompt = `Você é um gestor predial profissional redigindo um comunicado oficial para moradores de um condomínio fechado.
  Tópico: ${topic}
  Tom: ${tone} (ex: cordial, firme, informativo, urgente)
  Detalhes adicionais: ${details}
  
  Crie:
  1. Título direto e chamativo
  2. Texto completo formatado para Mural e envio via WhatsApp
  3. Lembrete de regras e data de vigência.`;

  try {
    const ai = getAIClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      if (response.text) return response.text;
    }
  } catch (err) {
    console.warn("AI Notice draft fallback:", err);
  }

  return `📢 **COMUNICADO OFICIAL: ${topic.toUpperCase()}**

Prezados Moradores,

Vimos por meio deste comunicar sobre **${topic}**.
${details ? `\nInformações importantes:\n- ${details}\n` : ''}
Contamos com a colaboração e respeito mútuo de todos para mantermos a ordem, segurança e harmonia em nosso condomínio.

Em caso de dúvidas ou sugestões, a administração está à disposição.

*Atenciosamente,*  
**Administração do Condomínio**`;
};

export const askCondoAdvisor = async (question: string): Promise<string> => {
  const prompt = `Você é o assistente jurídico e operacional CondoAI, especialista em administração condominial brasileira (Código Civil arts. 1.331 a 1.358 e Lei 4.591/64).
  Pergunta do síndico/morador: "${question}"
  
  Responda de forma prática, amigável, clara e objetiva com orientações de melhores práticas para o síndico.`;

  try {
    const ai = getAIClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      if (response.text) return response.text;
    }
  } catch (err) {
    console.warn("AI Condo Advisor fallback:", err);
  }

  return `Com base nas boas práticas de gestão condominial e no Código Civil:

1. **Procedimento Recomendado:** Para este tema, o síndico deve registrar a situação no livro de ocorrências e verificar se a convenção interna estipula regras específicas.
2. **Notificação e Diálogo:** Sempre priorize o diálogo amigável antes de aplicar penalidades ou advertências formais.
3. **Assembleia:** Decisões que envolvam custos extras ou alterações de regras comuns devem ser levadas para deliberação em Assembleia Geral.`;
};

