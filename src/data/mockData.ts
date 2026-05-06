import { Budget, Project, BudgetItem } from '../types';
import { createBudgetItem } from '@/src/lib/budgetFactory';

export const mockProjects: Project[] = [
  { id: 'p1', name: 'Evento Corporativo Anual', updatedAt: '2023-10-15T10:30:00Z' },
  { id: 'p2', name: 'Lançamento de Produto', updatedAt: '2023-11-02T14:20:00Z' },
];

const generateDefaultItems = (): BudgetItem[] => {
  const items: BudgetItem[] = [];
  let idCounter = 1;

  const addItem = (
    categoryId: string,
    itemNum: number,
    name: string,
    description: string = '',
    overrides: Partial<BudgetItem> = {},
  ) => {
    items.push(createBudgetItem(categoryId, `${categoryId}.${itemNum}`, {
      id: `i${idCounter++}`,
      name,
      description,
      ...overrides,
    }));
  };

  // 1.1 - Local | Hotel | Sala
  addItem('1.1', 1, 'Hospedagem', 'Single');
  addItem('1.1', 2, 'Hospedagem', 'Double');
  addItem('1.1', 3, 'Hospedagem', 'Staff');
  addItem('1.1', 4, 'Locação Sala', 'Evento');
  addItem('1.1', 5, 'Locação Sala', 'Montagem');
  addItem('1.1', 6, 'Locação de sala de apoio', '');
  addItem('1.1', 7, 'Camarim', '');
  addItem('1.1', 8, '', '');
  addItem('1.1', 9, '', '');
  addItem('1.1', 10, '', '');
  addItem('1.1', 11, '', '');
  addItem('1.1', 12, '', '');

  // 1.2 - A&B
  addItem('1.2', 1, 'Café da Manhã', 'Convidados');
  addItem('1.2', 2, 'Café da Manhã', 'Staff');
  addItem('1.2', 3, 'Welcome Coffee', '');
  addItem('1.2', 4, 'Coffee Break', '');
  addItem('1.2', 5, 'Coquetel', 'Pacote alimentação');
  addItem('1.2', 6, 'Coquetel', 'Pacote bebidas');
  addItem('1.2', 7, 'Almoço', 'Pacote alimentação');
  addItem('1.2', 8, 'Almoço', 'Pacote bebidas');
  addItem('1.2', 9, 'Almoço', 'Staff - considerar todos os staffs envolvidos');
  addItem('1.2', 10, 'Jantar', 'Pacote alimentação');
  addItem('1.2', 11, 'Jantar', 'Pacote bebidas');
  addItem('1.2', 12, 'Jantar', 'Staff - considerar todos os staffs envolvidos');
  addItem('1.2', 13, 'Happy Hour', 'Pacote alimentação - duração');
  addItem('1.2', 14, 'Happy Hour', 'Pacote bebidas - duração');
  addItem('1.2', 15, 'Festa', 'Pacote alimentação - duração');
  addItem('1.2', 16, 'Festa', 'Pacote bebidas - duração');
  addItem('1.2', 17, 'Camarim', '');
  addItem('1.2', 18, 'Degustação', '');
  addItem('1.2', 19, '', '');
  addItem('1.2', 20, '', '');

  // 1.3 - Técnica
  addItem('1.3', 1, 'Projeção', '');
  addItem('1.3', 2, 'Projeção', '');
  addItem('1.3', 3, 'Projeção', 'Retorno - sempre 01 tela 42 + 2 notes');
  addItem('1.3', 4, 'Sonorização', '');
  addItem('1.3', 5, 'Sonorização', '');
  addItem('1.3', 6, 'Iluminação', '');
  addItem('1.3', 7, 'Iluminação', '');
  addItem('1.3', 8, 'ART', '');
  addItem('1.3', 9, 'Sala de apoio', 'Impressora');
  addItem('1.3', 10, 'Clearcom', '');
  addItem('1.3', 11, 'Rider banda', '');
  addItem('1.3', 12, 'Gerador', '02 geradores em paralelo, 100m de cabo, 01 intermediária (DE ACORDO COM A POSSIBILIDADE DO CLIENTE) Verificar qt de kva\'s e metragem cabo');
  addItem('1.3', 13, 'Cabine de tradução', 'xxx fones');
  addItem('1.3', 14, 'Transmissão simultânea', '');
  addItem('1.3', 15, 'TP', '');
  addItem('1.3', 16, 'Internet', 'Evento');
  addItem('1.3', 17, 'Internet', 'House');
  addItem('1.3', 18, 'Internet', 'Sala de apoio');
  addItem('1.3', 19, 'Captação de Transmissão', '');
  addItem('1.3', 20, 'Streaming', 'Transmissão - qtde pax');
  addItem('1.3', 21, 'Streaming', 'LP');

  // 1.4 - Cenografia
  addItem('1.4', 1, 'Receptivo', '');
  addItem('1.4', 2, 'Receptivo', '');
  addItem('1.4', 3, 'Receptivo', '');
  addItem('1.4', 4, 'Plenária', '');
  addItem('1.4', 5, 'Plenária', '');
  addItem('1.4', 6, 'Plenária', '');
  addItem('1.4', 7, 'Festa', '');
  addItem('1.4', 8, 'Festa', '');
  addItem('1.4', 9, 'Festa', '');
  addItem('1.4', 10, 'Jantar', '');
  addItem('1.4', 11, 'Jantar', '');
  addItem('1.4', 12, 'Jantar', '');
  addItem('1.4', 13, 'Equipe e Logística de Cenografia', '');
  addItem('1.4', 14, 'Mobiliário', '');
  addItem('1.4', 15, 'Paisagismo | Dec Floral', '');

  // 1.5 - Material Gráfico | Promocional
  addItem('1.5', 1, 'Convite impresso', '');
  addItem('1.5', 2, 'Crachá', 'Corpo');
  addItem('1.5', 3, 'Crachá', 'Cordão');
  addItem('1.5', 4, 'Welcome Kit', 'Caderno');
  addItem('1.5', 5, 'Welcome Kit', 'Caneta');
  addItem('1.5', 6, 'Welcome Kit', 'Camiseta');
  addItem('1.5', 7, 'Welcome Kit', 'Sacochila');
  addItem('1.5', 8, 'Gift Out', 'Brinde');
  addItem('1.5', 9, 'Gift Out', 'Embalagem');
  addItem('1.5', 10, 'Manuseio', 'Manuseio de gift/ welcome Kit');

  // 1.6 - Conteúdo
  addItem('1.6', 1, 'Palestrante', '');
  addItem('1.6', 2, 'Mediador', '');
  addItem('1.6', 3, 'Vídeo', '');
  addItem('1.6', 4, 'Vinheta', '');
  addItem('1.6', 5, 'Site', '');

  // 1.7 - Atração
  addItem('1.7', 1, 'Banda', '');
  addItem('1.7', 2, 'Totem de fotos', '');
  addItem('1.7', 3, 'Maquiagem artística', '');
  addItem('1.7', 4, 'DJ', '');

  // 1.8 - Equipe de apoio
  addItem('1.8', 1, 'Mestre de Cerimônias', '');
  addItem('1.8', 2, 'Tradutor', '');
  addItem('1.8', 3, 'Promotor', '');
  addItem('1.8', 4, 'Uniforme Promotor', '');
  addItem('1.8', 5, 'Carregadores', '');
  addItem('1.8', 6, 'Fotógrafo', '');
  addItem('1.8', 7, 'Captação de vídeo', '');
  addItem('1.8', 8, 'Bombeiro', '');
  addItem('1.8', 9, 'Ambulância', '');
  addItem('1.8', 10, 'Limpeza', '');
  addItem('1.8', 11, 'Segurança', '');
  addItem('1.8', 12, 'Credenciamento', '');
  addItem('1.8', 13, 'Valet', '');
  addItem('1.8', 14, 'RSVP', 'Atendimento por 30 dias');
  addItem('1.8', 15, 'Disparo e-mail MKT', '');
  addItem('1.8', 16, 'Gerenciamento de Uploads', 'Qdo possuir upload de arquivos, landing page simples');

  // 1.9 - Logística
  addItem('1.9', 1, 'Transfer terrestre', '');
  addItem('1.9', 2, 'Transfer palestrante', '');
  addItem('1.9', 3, 'Transfer Aéreo', '');

  // 1.10 - Taxas e licenças
  addItem('1.10', 1, 'ECAD', '');
  addItem('1.10', 2, 'Liberação prefeitura', '');
  addItem('1.10', 3, 'Liberação CET', '');
  addItem('1.10', 4, 'Seguro de responsabilidade civil', '');

  // 1.11 - Diversos
  addItem('1.11', 1, '', '');
  addItem('1.11', 2, '', '');
  addItem('1.11', 3, '', '');

  // 1.12 - Extras
  addItem('1.12', 1, '', '');
  addItem('1.12', 2, '', '');
  addItem('1.12', 3, '', '');

  // 2.1 - Serviços internos | Nota fiscal Joy Eventos
  const viaNotaFiscal = { billingType: 'VIA NF' as const };
  addItem('2.1', 1, 'Verba de produção', '', viaNotaFiscal);
  addItem('2.1', 2, 'Rádios HT', '', viaNotaFiscal);
  addItem('2.1', 3, 'Clear com', '', viaNotaFiscal);
  addItem('2.1', 4, 'Logística equipe', 'Transporte equipe, evento e material evento', viaNotaFiscal);
  addItem('2.1', 5, 'Visita Técnica', 'aéreo, terrestre, hospedagem', viaNotaFiscal);
  addItem('2.1', 6, 'Produtor Executivo', '', viaNotaFiscal);
  addItem('2.1', 7, 'Produtor', 'Montagem e desmontagem', viaNotaFiscal);
  addItem('2.1', 8, 'Produtor', 'Evento', viaNotaFiscal);
  addItem('2.1', 9, 'Produtor Financeiro', 'orçamentos acima de 800k', viaNotaFiscal);
  addItem('2.1', 10, 'Diretor técnico', '', viaNotaFiscal);
  addItem('2.1', 11, 'Diretor artístico', '', viaNotaFiscal);
  addItem('2.1', 12, 'Diretor artístico online', 'qdo evento é híbrido', viaNotaFiscal);
  addItem('2.1', 13, 'Roteiro MC', 'Considerar dias de evento - R$ 4.500,00/ dia', viaNotaFiscal);
  addItem('2.1', 14, 'Conteúdo Site', '', viaNotaFiscal);
  addItem('2.1', 15, 'Curadoria Site', 'de acordo com cada assunto - avaliar a cada projeto', viaNotaFiscal);
  addItem('2.1', 16, 'Projeto Técnico Cenográfico', 'valor Ademir', viaNotaFiscal);
  addItem('2.1', 17, 'Eletricista', 'avaliar necessidades ceno/técnica', viaNotaFiscal);
  addItem('2.1', 18, 'Pacote Criação', 'KV', viaNotaFiscal);
  addItem('2.1', 19, 'Pacote Criação', 'Save', viaNotaFiscal);
  addItem('2.1', 20, 'Pacote Criação', 'Convite', viaNotaFiscal);
  addItem('2.1', 21, 'Pacote Criação', 'Reminder', viaNotaFiscal);
  addItem('2.1', 22, 'Pacote Criação', 'Crachá', viaNotaFiscal);
  addItem('2.1', 23, 'Pacote Criação', 'Cordão crachá', viaNotaFiscal);
  addItem('2.1', 24, 'Pacote Criação', 'Pacote cenográfico', viaNotaFiscal);
  addItem('2.1', 25, 'Pacote Criação', 'Site', viaNotaFiscal);
  addItem('2.1', 26, '', '', viaNotaFiscal);
  addItem('2.1', 27, '', '', viaNotaFiscal);
  addItem('2.1', 28, '', '', viaNotaFiscal);
  addItem('2.1', 29, '', '', viaNotaFiscal);
  addItem('2.1', 30, '', '', viaNotaFiscal);

  return items;
};

export const mockBudgets: Budget[] = [
  {
    id: 'b1',
    projectId: 'p1',
    name: 'Orçamento Principal v1',
    status: 'Rascunho',
    totalValue: 0,
    lastUpdated: '2023-10-15T10:30:00Z',
    honorariumPercentage: 10,
    items: generateDefaultItems(),
  },
  {
    id: 'b2',
    projectId: 'p1',
    name: 'Orçamento Alternativo v1',
    status: 'Em andamento',
    totalValue: 0,
    lastUpdated: '2023-10-14T15:45:00Z',
    honorariumPercentage: 10,
    items: generateDefaultItems(),
  },
  {
    id: 'b3',
    projectId: 'p2',
    name: 'Orçamento Inicial v1',
    status: 'Aprovado',
    totalValue: 0,
    lastUpdated: '2023-11-01T09:15:00Z',
    honorariumPercentage: 10,
    items: generateDefaultItems(),
  }
];
