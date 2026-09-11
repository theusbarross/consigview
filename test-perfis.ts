import { classificarPerfil } from './src/lib/businessLogic';
import { defaultRegras } from './src/lib/storage';

const scenarios = [
  { desc: "0 contratos, 0% margem (Esperado: Margem Virgem)", contratos: 0, percentual: 0 },
  { desc: "0 contratos, 10% margem (Esperado: Tomador Iniciante - Pela margem <=40%)", contratos: 0, percentual: 10 },
  { desc: "1 contrato, 0% margem (Esperado: Tomador Iniciante - Pela qtde de contratos <=1)", contratos: 1, percentual: 0 },
  { desc: "1 contrato, 30% margem (Esperado: Tomador Iniciante - Bate os dois no <=1 ou <=40%)", contratos: 1, percentual: 30 },
  { desc: "1 contrato, 50% margem (Esperado: Tomador Iniciante - Pela qtde de contratos <=1, mesmo margem sendo alta)", contratos: 1, percentual: 50 },
  { desc: "2 contratos, 30% margem (Esperado: Tomador Iniciante - Pela margem <=40%, mesmo tendo 2 contratos)", contratos: 2, percentual: 30 },
  { desc: "2 contratos, 50% margem (Esperado: Tomador Moderado - 2 a 3 contratos E 41% a 69%)", contratos: 2, percentual: 50 },
  { desc: "3 contratos, 65% margem (Esperado: Tomador Moderado)", contratos: 3, percentual: 65 },
  { desc: "3 contratos, 80% margem (Nenhuma regra bate exata)", contratos: 3, percentual: 80 },
  { desc: "4 contratos, 60% margem (Nenhuma regra bate exata)", contratos: 4, percentual: 60 },
  { desc: "4 contratos, 75% margem (Esperado: Tomador Agressivo - 4+ contratos E 70%+ margem)", contratos: 4, percentual: 75 },
  { desc: "5 contratos, 90% margem (Esperado: Tomador Agressivo)", contratos: 5, percentual: 90 },
];

console.log("=== INICIANDO TESTES DE CLASSIFICAÇÃO DE PERFIL ===\n");

for (const sc of scenarios) {
  // Mock array de contratos deferidos
  const contratosArr = Array(sc.contratos).fill({ situacao: 'DEFERIDA' });
  const result = classificarPerfil(contratosArr as any, sc.percentual, defaultRegras);
  
  console.log(`Cenário: ${sc.desc}`);
  console.log(`-> Resultado: ${result ? result.nome : 'NENHUM PERFIL (null)'}`);
  console.log('---');
}
