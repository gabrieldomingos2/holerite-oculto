# Holerite Oculto

**Acesse:** https://gabrieldomingos2.github.io/holerite-oculto/

Calculadora web que mostra o **custo real de um funcionário CLT para a empresa** no Brasil, os **impostos que o trabalhador paga no ano** e **quantos dias ele trabalha só para pagar tributos**.

Regras de **2026**: tabela do INSS, IRRF com a isenção até R$ 5.000 (Lei nº 15.270/2025), encargos patronais e FGTS.

## Funcionalidades

- **Custo da empresa**: salário, 13º, férias + 1/3, INSS patronal, RAT, terceiros e FGTS
- **Regime tributário**: Lucro Presumido/Real, Simples Nacional e Simples Anexo IV
- **Benefícios**: vale-refeição/alimentação, plano de saúde e vale-transporte
- **Custos indiretos (opcional)**: provisão de aviso prévio, equipamento, seguro de vida, exames ocupacionais e treinamento
- **Impostos do trabalhador**: INSS, IR, impostos sobre consumo (estimativa) e IPVA/IPTU
- **Dias trabalhados para pagar impostos**: calendário de 2026 mês a mês, com o "dia da liberdade" destacado e comparação com a média do IBPT
- **Feito pro celular**: valores rápidos de salário, resultado logo abaixo do campo, ajustes recolhidos e barra de resumo fixa
- **Compartilhar resultado** pelo menu do celular (ou copiar, no computador)

## Como rodar

O site não precisa de build nem de dependências. Abra o `index.html` no navegador.

Para publicar, envie a pasta inteira para qualquer hospedagem estática (GitHub Pages, Vercel, Netlify).

## Estrutura

```
custo-clt/
├── index.html                  # Página e formulário
├── assets/
│   ├── css/style.css           # Estilos
│   └── js/
│       ├── tributos-2026.js    # Tabelas e regras de INSS e IR (atualizar todo ano)
│       └── app.js              # Cálculos de custo e interface
└── README.md
```

## Premissas do cálculo

| Item | Regra |
|---|---|
| Remuneração anual | 12 salários + 13º + 1/3 de férias (13,33 salários) |
| INSS do empregado | 7,5% / 9% / 12% / 14%, progressivo, teto de R$ 8.475,55 |
| IRRF | Tabela progressiva, desconto simplificado de R$ 607,20, isenção até R$ 5.000 e redutor até R$ 7.350 |
| INSS patronal | 20% (Presumido/Real e Simples Anexo IV) |
| RAT/SAT | 1%, 2% ou 3%, conforme o risco da atividade |
| Terceiros | 5,8% (Sistema S, salário-educação, Incra, Sebrae), só Presumido/Real |
| FGTS | 8% sobre toda a remuneração |
| Aviso prévio | 30 dias + 3 por ano de casa (máx. 90), diluído pelos anos de casa |
| Impostos no consumo | Percentual ajustável (padrão 28%) sobre o salário líquido |
| Dias de imposto | Impostos ÷ renda bruta anual × 365 (mesmo método do IBPT) |

**Fora do cálculo:** desoneração da folha (CPRB), hora extra, adicionais (noturno, insalubridade, periculosidade), PLR, estrutura física e o ajuste anual do IR.

## Aviso

Esta é uma simulação educativa e não substitui o cálculo de um contador ou do RH.

## Fontes

- [Tabela INSS 2026 — Contabilizei](https://www.contabilizei.com.br/contabilidade-online/tabela-inss/)
- [Tabela IRRF 2026 — Caltrab](https://caltrab.com/?p=4768)
- [Estudo IBPT 2026 — InfoMoney](https://www.infomoney.com.br/?p=3352708)
