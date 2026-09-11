import { NextResponse } from 'next/server';
import type { RespostaConsiglogRaw } from '@/lib/margemApi';

const MOCK_MODE = process.env.USE_MOCK_API === 'true';

// Generate mock data mimicking real API (with defensive fields included)
function gerarMockRaw(cpf: string): RespostaConsiglogRaw {
  if (cpf === '00000000000') {
    throw new Error('404_NOT_FOUND');
  }

  if (cpf === '42942942942') {
    throw new Error('429_LIMIT_REACHED');
  }

  return {
    meta: { tentativas_key: 1, tentativas_extrato: 1, max_key: 20, max_extrato: 10 },
    cpf,
    nome: 'JOÃO DA SILVA SERVIDOR (Mock)',
    processado_em: new Date().toISOString(),
    servidores: [
      {
        matricula: '9876543',
        tipo_servico: 'EMPRÉSTIMO - 1',
        margem_disponivel: 450.0,
        margem_total: 2000.0,
        consignatarias: [
          {
            nome: 'BANCO DO BRASIL S.A.',
            codigo: '001',
            contratos: [
              {
                numero: '1111111',
                valor_parcela: 550.0,
                saldo_devedor: 15000.0,
                situacao: 'Deferida',
                ade: 'ADE-12345',
                prestacoes: 96,
                pagas: 24,
                deferimento: '2022-05-10',
                quitacao: null,
                ultimo_desconto: '2024-02-10',
                ultima_parcela: '2030-05-10'
              },
              {
                numero: '2222222',
                valor_parcela: 1000.0,
                saldo_devedor: 0.0,
                situacao: 'Quitada',
                ade: 'ADE-54321',
                prestacoes: 72,
                pagas: 72,
                deferimento: '2018-01-10',
                quitacao: '2024-01-10',
                ultimo_desconto: '2024-01-10',
                ultima_parcela: '2024-01-10'
              }
            ]
          }
        ]
      }
    ]
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cpf = searchParams.get('cpf');

  // Segurança: Só processar a API se tiver o cookie de login
  const { cookies } = require('next/headers');
  const token = (await cookies()).get('consigview_auth_token');
  if (!token) {
    return NextResponse.json({ error: 'unauthorized', message: 'Faça login para usar a API' }, { status: 401 });
  }

  if (!cpf || cpf.length < 11) {
    return NextResponse.json({ error: 'cpf_invalido', message: 'CPF ausente ou formato inválido' }, { status: 400 });
  }

  if (MOCK_MODE) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData = gerarMockRaw(cpf);
      return NextResponse.json(mockData);
    } catch (e: any) {
      if (e.message === '429_LIMIT_REACHED') {
        return NextResponse.json({ error: 'day_limit', uso: 100, limite: 100, message: 'Limite diário atingido' }, { status: 429 });
      }
      return NextResponse.json({ error: 'not_found', message: 'Servidor não encontrado' }, { status: 404 });
    }
  }

  // Real API Fetch
  const apiKey = process.env.MARGEM_API_KEY;
  const baseUrl = process.env.MARGEM_API_BASE_URL;

  if (!apiKey || !baseUrl) {
    return NextResponse.json({ error: 'config_erro', message: 'Configuração do servidor incompleta' }, { status: 500 });
  }

  try {
    const apiRes = await fetch(`${baseUrl}/api/consulta?cpf=${cpf}&api_key=${apiKey}`, {
      headers: {
        'Accept': 'application/json'
      },
      // Timeout via AbortController could be implemented here for 504 treatment
    });

    if (!apiRes.ok) {
      if (apiRes.status === 429) {
        const errorData = await apiRes.json().catch(() => ({}));
        return NextResponse.json({
          error: errorData.error || 'limit_reached',
          uso: errorData.uso,
          limite: errorData.limite,
          message: 'Limite atingido'
        }, { status: 429 });
      }
      
      const text = await apiRes.text();
      return NextResponse.json({ error: 'api_error', message: text || `Erro ${apiRes.status}` }, { status: apiRes.status });
    }

    const data = await apiRes.json();
    require('fs').writeFileSync('./debug_api.json', JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Fetch Error:', error);
    return NextResponse.json({ error: 'timeout', message: 'Servidor externo não respondeu (timeout)' }, { status: 504 });
  }
}
