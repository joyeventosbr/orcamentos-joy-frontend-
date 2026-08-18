# Frontend — campo `projectedValue` (Valor Projetado)

Guia de implementação no frontend para o campo **valor projetado** adicionado aos orçamentos no backend.

## Resumo

O backend passou a persistir e expor `projectedValue` em orçamentos. Trata-se de um **número monetário não negativo** (`>= 0`), com default `0` quando omitido na criação.

| Propriedade API | Tipo DB | Default | Obrigatório na API |
|---|---|---|---|
| `projectedValue` | `number` (double) | `0` | Não (opcional em create/update; sempre retornado em leitura) |

---

## Contrato da API

### Endpoints afetados

| Método | Rota | `projectedValue` |
|---|---|---|
| `GET` | `/budgets` | Retornado em cada item da lista |
| `GET` | `/budgets/:id` | Retornado |
| `GET` | `/budgets/:id/details` | Retornado |
| `POST` | `/budgets` | Aceito no body (opcional) |
| `PUT` | `/budgets/:id` | Aceito no body (opcional) |
| `POST` | `/budgets/:id/copy` | Copiado do orçamento original (sem input no body) |
| `PATCH` | `/budgets/:id/approve` | Retornado (valor preservado) |
| `PATCH` | `/budgets/:id/approve-to-production` | Retornado (valor preservado) |
| `GET` | `/budgets/:id/export` | **Não incluído** no CSV de exportação |

### Request — criar orçamento

```http
POST /budgets
Content-Type: application/json
```

```json
{
  "name": "Orçamento Evento X",
  "customerId": "uuid-do-cliente",
  "folderId": "uuid-da-pasta",
  "projectedValue": 150000
}
```

- `projectedValue` é **opcional**. Se omitido, o backend grava `0`.
- Demais campos obrigatórios permanecem: `name`, `customerId`, `folderId`.

### Request — atualizar orçamento

```http
PUT /budgets/:id
Content-Type: application/json
```

```json
{
  "projectedValue": 175000
}
```

- Envie apenas os campos que deseja alterar (partial update).
- Só é possível editar quando `isEditable === true`.

### Response — item de lista / detalhe

```json
{
  "id": "uuid",
  "name": "Orçamento Evento X",
  "customerId": "uuid",
  "folderId": "uuid",
  "taxNf": 8.65,
  "projectedValue": 150000,
  "status": "CONCORRENCIA",
  "isEditable": true,
  "isDeletable": true,
  "parentId": null,
  "version": 0,
  "createdAt": "2026-08-18T00:00:00.000Z",
  "updatedAt": "2026-08-18T00:00:00.000Z"
}
```

No detalhe (`/budgets/:id/details`), a estrutura é a mesma, com campos adicionais (`customerName`, `folderName`, `lines`, etc.).

---

## Validação (backend)

Regras que o frontend deve espelhar para evitar `400 Bad Request`:

| Regra | Mensagem de erro |
|---|---|
| Deve ser um número finito | `"Valor projetado inválido"` |
| Deve ser `>= 0` | `"Valor projetado inválido"` |
| Orçamento não editável | `"Orçamento não pode ser editado"` |

Schema Zod no backend:

```ts
projectedValue: z.number().nonnegative().optional()
```

---

## Tipos TypeScript (frontend)

Atualizar interfaces/types existentes de orçamento:

```ts
// Respostas
interface BudgetListItem {
  // ...campos existentes
  projectedValue: number;
}

interface BudgetDetail extends BudgetListItem {
  customerName: string;
  folderName: string;
  lines: BudgetLine[];
}

// Requests
interface CreateBudgetRequest {
  name: string;
  customerId: string;
  folderId: string;
  projectedValue?: number;
}

interface UpdateBudgetRequest {
  name?: string;
  customerId?: string;
  folderId?: string;
  projectedValue?: number;
  jobDescription?: string;
  location?: string;
  eventDate?: string;
  paymentTerm?: PaymentTerm;
}
```

Se o projeto usa geração de tipos a partir do OpenAPI/Swagger, regenere os types após deploy do backend.

---

## O que implementar na UI

### 1. Formulário de criação de orçamento

- Adicionar campo **Valor projetado** (`projectedValue`).
- Input numérico com máscara/formatação monetária (BRL).
- Opcional na criação; placeholder ou hint: *"Deixe em branco para R$ 0,00"*.
- Validar client-side: número >= 0 antes de enviar.

### 2. Formulário / painel de edição do orçamento

- Exibir e permitir editar `projectedValue` junto aos demais dados gerais (`jobDescription`, `location`, `eventDate`, `paymentTerm`, etc.).
- Desabilitar o campo quando `isEditable === false` (orçamentos aprovados).
- Enviar via `PUT /budgets/:id` apenas quando o valor for alterado (ou junto com o save geral do formulário).

### 3. Listagem de orçamentos

- Exibir coluna ou badge com o valor projetado formatado (ex.: `R$ 150.000,00`).
- Considerar ordenação/filtro por valor projetado, se fizer sentido para o produto.

### 4. Tela de detalhe do orçamento

- Mostrar `projectedValue` no cabeçalho/resumo do orçamento, próximo a `taxNf` e status.
- Diferenciar visualmente de totais calculados das linhas (`budget-lines`), se existirem — **valor projetado é meta/referência informada manualmente**, não é calculado pelo backend a partir das linhas.

### 5. Cópia de orçamento

- Nenhuma ação extra no frontend: `POST /budgets/:id/copy` copia automaticamente o `projectedValue` do original.
- Após copiar, a resposta já virá com o valor copiado.

### 6. Exportação

- O CSV exportado (`GET /budgets/:id/export`) **não** inclui `projectedValue`.
- Se a exportação for feita no frontend (PDF/planilha customizada), incluir o campo manualmente lendo do objeto do orçamento.

---

## Formatação sugerida

```ts
const formatProjectedValue = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
```

Para input, converter string formatada de volta para número antes do submit:

```ts
const parseCurrencyInput = (raw: string): number => {
  const normalized = raw
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};
```

---

## Compatibilidade / migração

- Orçamentos existentes no banco recebem `projectedValue = 0` via migration.
- O frontend deve tratar `0` como valor válido (não confundir com "não informado" a menos que a UX exija distinção).
- Não é necessário feature flag: o campo já está presente em todas as respostas de leitura.

---

## Checklist de implementação

- [ ] Atualizar types/interfaces de `Budget`, `BudgetListItem`, `BudgetDetail`
- [ ] Atualizar types de `CreateBudgetRequest` e `UpdateBudgetRequest`
- [ ] Adicionar campo no formulário de criação
- [ ] Adicionar campo no formulário de edição (respeitando `isEditable`)
- [ ] Validação client-side: número finito, `>= 0`
- [ ] Exibir valor formatado na listagem
- [ ] Exibir valor formatado no detalhe/resumo do orçamento
- [ ] Tratar erro `"Valor projetado inválido"` na UI
- [ ] Regenerar types OpenAPI (se aplicável)
- [ ] Testar fluxo: criar → editar → copiar → aprovar (campo preservado)

---

## Referência no backend

Arquivos alterados nesta feature:

- `src/domain/budgets/entities/budget.entity.ts`
- `src/domain/budgets/dtos/budget-list/budget-list-item-response.dto.ts`
- `src/domain/budgets/dtos/budget-detail/budget-detail-response.dto.ts`
- `src/api/dtos/budgets/requests/create-budget-request.api.dto.ts`
- `src/api/dtos/budgets/requests/update-budget-request.api.dto.ts`
- `src/application/budgets/usecases/budget/create/create-budget.dto.ts`
- `src/application/budgets/usecases/budget/update/update-budget.dto.ts`
- `src/infra/database/typeorm/schemas/budget.schema.ts`
- `src/infra/database/typeorm/migrations/1778990000000-migration_v016_budget_projected_value.ts`
