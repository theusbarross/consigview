# 💼 ConsigView - Análise e Simulação de Margem

**ConsigView** é um sistema web moderno e inteligente focado no mercado de crédito consignado. O sistema consome dados de uma API externa de margens e contratos de servidores, processa essas informações e apresenta um painel de inteligência comercial (Dashboard) completo para os corretores.

O grande objetivo do ConsigView é **facilitar a leitura de extratos complexos**, classificando automaticamente o perfil do cliente e mostrando logo de cara as melhores oportunidades de saque (simulação de crédito baseada em prazos e taxas).

---

## ✨ Principais Funcionalidades

- **Integração de Dados:** Busca em tempo real informações como Nome, CPF, Matrícula, Margem Utilizada/Disponível e lista completa de Contratos Ativos.
- **Calculadora de Oportunidades:** Permite selecionar diferentes bancos, prazos e taxas de juros (configuráveis) para calcular instantaneamente o Valor Liberado (Estimativa de Saque) em cima da margem disponível.
- **Inteligência de Perfilamento:** Classifica o cliente em perfis dinâmicos baseados em regras customizáveis:
  - *Exemplo:* "Margem Virgem", "Tomador Iniciante", "Tomador Moderado", "Tomador Agressivo".
- **Painel de Configurações:** Uma interface amigável (salva no navegador via `localStorage`) para o corretor gerenciar as tabelas de coeficientes dos bancos, prazos, taxas e editar os gatilhos dos perfis.
- **Filtros Avançados:** Tabela de contratos com busca em tempo real por Banco, ADE ou Situação (Deferida, Quitada, etc).
- **Segurança Nativa (Produção):** Sistema de login robusto executado no lado do servidor (Next.js Middleware + Server Actions) usando Cookies HttpOnly, blindando a API contra acessos não autorizados.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído focado em extrema performance e design premium.

- **[Next.js 14+ (App Router)](https://nextjs.org/)**: Framework React para renderização, roteamento e ações de servidor.
- **[React 18](https://react.dev/)**: Biblioteca de interfaces baseada em componentes.
- **[Tailwind CSS](https://tailwindcss.com/)**: Estilização baseada em utilitários para criar o design de *Glassmorphism* (Vidro Fosco) e animações fluidas.
- **[shadcn/ui](https://ui.shadcn.com/)** & **Lucide Icons**: Componentes de interface reutilizáveis e ícones.
- **TypeScript**: Tipagem estática para maior segurança e prevenção de bugs.

---

## 🔒 Segurança e Gestão de Usuários

O sistema possui uma tela de acesso restrito. As credenciais **não ficam salvas no código-fonte**, prevenindo vazamentos no GitHub. Os usuários autorizados são lidos a partir de variáveis de ambiente.

Para cadastrar novos usuários ou senhas:

1. Modifique a variável `AUTH_USERS` no seu `.env.local` (ou no painel da Vercel).
2. O formato exigido é uma lista separada por vírgulas de `usuario:senha`.
3. Exemplo:
   ```env
   AUTH_USERS="admin:123,corretor1:senhaSegura"
   ```

A API interna de proxy (`/api/consulta`) também possui um Middleware de validação do Cookie para evitar consumo indevido da franquia da API real caso a URL vaze.

---

## 🚀 Como Executar Localmente

### 1. Clonar e Instalar
Faça o clone do repositório e instale as dependências usando NPM ou Yarn:
```bash
git clone https://github.com/SEU_USUARIO/ConsigView.git
cd ConsigView
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo chamado `.env.local` na raiz do projeto contendo as chaves necessárias:
```env
# URL e Chave da API Real de Consulta
MARGEM_API_BASE_URL="https://sua-api.com"
MARGEM_API_KEY="SuaChaveDeApiAqui"

# Se true, não consome a API real e usa dados fictícios de teste
USE_MOCK_API="false"

# Usuários permitidos a fazer Login no sistema
AUTH_USERS="admin:123"
```

### 3. Rodar o Servidor
```bash
npm run dev
```
O sistema estará disponível em [http://localhost:3000](http://localhost:3000).

---

## 🎨 Design e UI/UX

O ConsigView foi criado focado numa experiência de usuário fluida e moderna:
- **Aesthetics Premium:** Paleta de cores vibrante, fundo dinâmico animado e painéis translúcidos (*glassmorphism*).
- **Responsive Design:** Totalmente adaptado para Mobile, Tablets e Desktops.
- **Micro-interações:** Botões e cartões que respondem ao passe de mouse para dar uma sensação de "software vivo".
- **Modo Claro/Escuro:** Suporte completo via `next-themes`.

---
*Feito com foco no mercado financeiro e na praticidade das operações diárias de crédito.*
