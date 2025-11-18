import { Clause } from '../types/contractTypes';

export const DEFAULT_CLAUSES: Clause[] = [
  {
    id: 'clause-1',
    title: 'Primeira - Objeto da Locação',
    content: `O objeto da presente locação é de uma ${"{PROPERTY}"}, localizado na Rua ${"{STREET}"} nº ${"{NUMBER}"}, ${"{CITY}"}, CEP: ${"{ZIPCODE}"}, Bairro ${"{NEIGHBORHOOD}"}.`,
  },
  {
    id: 'clause-2',
    title: 'Segunda - Prazo da Locação',
    content: `O prazo da locação inicia-se em ${"{START_DATE}"} e termina em ${"{END_DATE}"}, independentemente de aviso, notificação ou interpelação judicial ou mesmo extrajudicial.`,
  },
  {
    id: 'clause-3',
    title: 'Terceira - Pagamento do Aluguel',
    content: `O aluguel mensal deverá ser pago até o dia ${"{DUE_DAY}"} do mês subseqüente ao vencido, no local indicado pelo LOCADOR. O valor correspondente é de R$ ${"{RENT}"} mensais, reajustados anualmente, de conformidade com a variação do IGP-M apurada no ano anterior.`,
  },
  {
    id: 'clause-4',
    title: 'Quarta - Multa e Juros Moratórios',
    content: `Em caso de mora no pagamento do aluguel, aplicar-se-á uma multa de 2% (dois por cento) sobre o valor devido e juros mensais de 1% (um por cento) do montante devido. FICARÁ POR CONTA DO LOCATÁRIO TODOS OS DÉBITOS DE ÁGUA E LUZ.`,
  },
  {
    id: 'clause-5',
    title: 'Quinta - Renúncia de Direitos',
    content: `Fica convencionado ainda pelos contratantes que o pagamento da multa não significa a renúncia de qualquer direito ou aceitação da emenda judicial da mora, em caso de qualquer procedimento judicial contra o LOCATÁRIO.`,
  },
  {
    id: 'clause-6',
    title: 'Sexta - Conservação do Imóvel',
    content: `As obras e despesas com a conservação, limpeza e asseio do imóvel correrão por conta, risco e ônus do LOCATÁRIO, ficando este obrigado a devolver o imóvel em perfeitas condições de limpeza, asseio, conservação e pintura, quando finda ou rescindida esta avença. O LOCATÁRIO não poderá realizar obras de vulto e nem modificar a estrutura do imóvel ora locado, sem prévia autorização por escrito do LOCADOR.`,
  },
  {
    id: 'clause-7',
    title: 'Sétima - Recebimento do Imóvel',
    content: `O LOCATÁRIO declara receber o imóvel em perfeito estado de conservação e limpeza, com pintura nova, fechaduras, vidros, parte elétrica e hidráulica e tudo mais em perfeito funcionamento e todas as contas de água e luz pagas.`,
  },
  {
    id: 'clause-8',
    title: 'Oitava - Destinação do Imóvel',
    content: `O LOCATÁRIO declara, que o imóvel ora locado, destina-se única e exclusivamente para o seu uso residencial.`,
  },
  {
    id: 'clause-9',
    title: 'Nona - Proibição de Sublocação',
    content: `O LOCATÁRIO não poderá sublocar, transferir ou ceder o imóvel, sendo nulo de pleno direito qualquer ato praticado com este fim sem o consentimento prévio e por escrito do LOCADOR.`,
  },
  {
    id: 'clause-10',
    title: 'Décima - Sinistro do Imóvel',
    content: `Em caso de sinistro parcial ou total do imóvel locado, que o torne inabitável, o presente contrato ficará rescindido, de pleno direito, independentemente de aviso ou interpelação judicial ou extrajudicial.`,
  },
  {
    id: 'clause-11',
    title: 'Décima Primeira - Desapropriação',
    content: `Em caso de desapropriação total ou parcial do imóvel locado, ficará rescindido de pleno direito o presente contrato de locação, independente de quaisquer indenizações de ambas as partes ou contratantes.`,
  },
  {
    id: 'clause-12',
    title: 'Décima Segunda - Preferência na Venda',
    content: `No caso de alienação do imóvel, obriga-se o LOCADOR a dar preferência ao LOCATÁRIO, e se o mesmo não se utilizar dessa prerrogativa, o LOCADOR deverá constar do respectivo contrato de compra e venda a existência do presente contrato.`,
  },
  {
    id: 'clause-13',
    title: 'Décima Terceira - Vistoria',
    content: `Ao LOCADOR é facultado, por si ou seus procuradores, vistoriar o imóvel, sempre que achar conveniente, para certeza do cumprimento das obrigações assumidas neste contrato.`,
  },
  {
    id: 'clause-14',
    title: 'Décima Quarta - Multas e Intimações',
    content: `Cabe ao LOCATÁRIO, o cumprimento, dentro dos prazos legais, de quaisquer multas ou intimações por infrações das leis, portarias ou regulamentos vigentes, originários de quaisquer repartições ou entidades.`,
  },
  {
    id: 'clause-15',
    title: 'Décima Quinta - Infrações Contratuais',
    content: `A infração de qualquer das cláusulas do presente contrato, sujeita o infrator à multa equivalente a 01 (um) mês de aluguel, tomando-se por base, o último aluguel vencido, cobrável ou não por ação executiva.`,
  },
  {
    id: 'clause-16',
    title: 'Décima Sexta - Foro Competente',
    content: `As partes contratantes obrigam-se por si, herdeiros e/ou sucessores, elegendo o Foro da Cidade de Salvador, para o processamento de qualquer ação oriunda da presente avença, renunciando a qualquer outro.`,
  },
  {
    id: 'clause-17',
    title: 'Décima Sétima - Responsabilidade por Fenômenos Naturais',
    content: `O LOCADOR(A) não será responsabilizado por danos ao imóvel ou aos pertences do LOCATÁRIO(A) causados por fenômenos da natureza, como enchentes, tempestades, vendavais ou raios. O LOCATÁRIO(A) deverá comunicar qualquer ocorrência imediatamente.`,
  },
  {
    id: 'clause-18',
    title: 'Décima Oitava - Fiador',
    content: `O FIADOR acima qualificado assume a posição de devedor solidário do LOCATÁRIO, respondendo com todos os seus bens presentes e futuros pelo cumprimento integral das obrigações assumidas neste contrato.`,
  },
];
