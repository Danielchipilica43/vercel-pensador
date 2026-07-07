// prisma/seed.ts
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

// 🔥 Função para formatar nomes (Primeira Maiúscula, resto minúscula)
function formatarNome(nome: string): string {
  return nome
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
}

// 🔥 Função para formatar textos em maiúsculas (para códigos/siglas)
function formatarMaiusculas(texto: string): string {
  return texto.toUpperCase();
}

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // ============================================
  // 1. TABELAS DE STATUS (LOOKUP TABLES)
  // ============================================

  console.log("📋 Criando tabelas de status...");

  // UserNivel
  await prisma.userNivel.upsert({
    where: { nome: "ADMIN" },
    update: {},
    create: { nome: "ADMIN" },
  });
  await prisma.userNivel.upsert({
    where: { nome: "GESTOR" },
    update: {},
    create: { nome: "GESTOR" },
  });
  await prisma.userNivel.upsert({
    where: { nome: "VISUALIZADOR" },
    update: {},
    create: { nome: "VISUALIZADOR" },
  });
  console.log("  ✅ UserNivel inseridos");

  // Genero
  await prisma.genero.upsert({
    where: { nome: formatarNome("masculino") },
    update: {},
    create: { nome: formatarNome("masculino") },
  });
  await prisma.genero.upsert({
    where: { nome: formatarNome("feminino") },
    update: {},
    create: { nome: formatarNome("feminino") },
  });
  await prisma.genero.upsert({
    where: { nome: formatarNome("outro") },
    update: {},
    create: { nome: formatarNome("outro") },
  });
  console.log("  ✅ Generos inseridos");

  // StatusInscricao
  await prisma.statusInscricao.upsert({
    where: { nome: "PENDENTE" },
    update: {},
    create: { nome: "PENDENTE" },
  });
  await prisma.statusInscricao.upsert({
    where: { nome: "APROVADA" },
    update: {},
    create: { nome: "APROVADA" },
  });
  await prisma.statusInscricao.upsert({
    where: { nome: "REJEITADA" },
    update: {},
    create: { nome: "REJEITADA" },
  });
  console.log("  ✅ StatusInscricao inseridos");

  // StatusMatricula
  await prisma.statusMatricula.upsert({
    where: { nome: "PENDENTE" },
    update: {},
    create: { nome: "PENDENTE" },
  });
  await prisma.statusMatricula.upsert({
    where: { nome: "ATIVA" },
    update: {},
    create: { nome: "ATIVA" },
  });
  await prisma.statusMatricula.upsert({
    where: { nome: "CONCLUIDA" },
    update: {},
    create: { nome: "CONCLUIDA" },
  });
  await prisma.statusMatricula.upsert({
    where: { nome: "CANCELADA" },
    update: {},
    create: { nome: "CANCELADA" },
  });
  console.log("  ✅ StatusMatricula inseridos");

  // StatusPagamento
  const statusPagamentos = [
    { nome: "PENDENTE", descricao: formatarNome("pagamento pendente") },
    { nome: "AGUARDANDO_COMPROVATIVO", descricao: formatarNome("aguardando envio do comprovativo") },
    { nome: "COMPROVATIVO_ENVIADO", descricao: formatarNome("comprovativo enviado, aguardando verificação") },
    { nome: "VERIFICADO", descricao: formatarNome("comprovativo em verificação") },
    { nome: "APROVADO", descricao: formatarNome("pagamento aprovado") },
    { nome: "REJEITADO", descricao: formatarNome("pagamento rejeitado") },
    { nome: "CANCELADO", descricao: formatarNome("pagamento cancelado") },
  ];

  for (const status of statusPagamentos) {
    await prisma.statusPagamento.upsert({
      where: { nome: status.nome },
      update: {},
      create: status,
    });
  }
  console.log("  ✅ StatusPagamento inseridos");

  // Turno
// Turno - Mantém em MAIÚSCULAS
await prisma.turno.upsert({
  where: { nome: "MANHA" },
  update: {},
  create: { nome: "MANHA" },
});
await prisma.turno.upsert({
  where: { nome: "TARDE" },
  update: {},
  create: { nome: "TARDE" },
});
await prisma.turno.upsert({
  where: { nome: "NOITE" },
  update: {},
  create: { nome: "NOITE" },
});
console.log("  ✅ Turnos inseridos");

  // Periodo
  const anoAtual = new Date().getFullYear();
  const periodos = [
    { nome: `${anoAtual}.1 - ${formatarNome("1º semestre")}` },
    { nome: `${anoAtual}.2 - ${formatarNome("2º semestre")}` },
    { nome: `${anoAtual + 1}.1 - ${formatarNome("1º semestre")}` },
    { nome: `${anoAtual + 1}.2 - ${formatarNome("2º semestre")}` },
  ];

  for (const periodo of periodos) {
    await prisma.periodo.upsert({
      where: { nome: periodo.nome },
      update: {},
      create: periodo,
    });
  }
  console.log("  ✅ Periodos inseridos");

  // ============================================
  // 2. DADOS DA INSTITUIÇÃO
  // ============================================

  console.log("\n🏫 Inserindo dados da instituição...");

  // Cursos
  const cursos = [
    { nome: "Informática", duracao: 4, descricao: formatarNome("curso técnico em informática"), vagas: 170, ativo: true },
    { nome: "Electricidade", duracao: 4, descricao: formatarNome("curso técnico em electricidade"), vagas: 160, ativo: true },
    { nome: "Máquinas e Motores", duracao: 4, descricao: formatarNome("curso técnico em máquinas e motores"), vagas: 140, ativo: true },
    { nome: "Construção Civil", duracao: 4, descricao: formatarNome("curso técnico em construção civil"), vagas: 150, ativo: true },
  ];

  for (const curso of cursos) {
    await prisma.curso.upsert({
      where: { nome: curso.nome },
      update: {},
      create: curso,
    });
  }
  console.log("  ✅ Cursos inseridos");

  // Classes
  const classes = [
    { nome: "10ª", descricao: formatarNome("10ª classe") },
  ];

  for (const classe of classes) {
    await prisma.classe.upsert({
      where: { nome: classe.nome },
      update: {},
      create: classe,
    });
  }
  console.log("  ✅ Classes inseridas");

  // ============================================
  // 3. TURMAS
  // ============================================

  console.log("\n🏫 Criando turmas...");

  const cursosList = await prisma.curso.findMany();
  const turnosList = await prisma.turno.findMany();

  for (const curso of cursosList) {
    for (const turno of turnosList) {
      const nomeCursoFormatado = formatarNome(curso.nome);
      const nomeTurnoFormatado = formatarNome(turno.nome);
      const nomeTurma = `${nomeCursoFormatado} - ${nomeTurnoFormatado} ${anoAtual}`;
      
      await prisma.turma.upsert({
        where: { nome: nomeTurma },
        update: {},
        create: {
          nome: nomeTurma,
          descricao: formatarNome(`turma de ${curso.nome} - turno ${turno.nome}`),
          cursoId: curso.id,
          turnoId: turno.id,
          anoLetivo: anoAtual.toString(),
          vagasTotais: 50,
          vagasDisponiveis: 50,
        },
      });
    }
  }
  console.log(`  ✅ ${cursosList.length * turnosList.length} turmas criadas`);

  // ============================================
  // 4. USUÁRIO ADMIN
  // ============================================

  console.log("\n👤 Criando usuário admin...");

  const nivelAdmin = await prisma.userNivel.findFirst({
    where: { nome: "ADMIN" },
  });
  const generoMasculino = await prisma.genero.findFirst({
    where: { nome: formatarNome("masculino") },
  });

  if (nivelAdmin && generoMasculino) {
    const senhaHash = await bcrypt.hash("123456", 10);

    await prisma.user.upsert({
      where: { email: "chipilica701@gmail.com" },
      update: {
        senha: senhaHash,
        ativo: true,
        nome: formatarNome("administrador"),
      },
      create: {
        email: "chipilica701@gmail.com",
        nome: formatarNome("administrador"),
        senha: senhaHash,
        generoId: generoMasculino.id,
        nivelId: nivelAdmin.id,
        ativo: true,
      },
    });
    console.log("  ✅ Usuário admin criado/atualizado");
    console.log("     Email: chipilica701@gmail.com");
    console.log("     Senha: 123456");
    console.log("     Nome: Administrador");
  }

  // ============================================
  // 5. FORMAS DE PAGAMENTO PADRÃO
  // ============================================

  console.log("\n💰 Inserindo formas de pagamento...");

  const statusPendente = await prisma.statusPagamento.findFirst({
    where: { nome: "PENDENTE" },
  });

  if (statusPendente) {
    const pagamentosExistentes = await prisma.pagamento.count();
    
    if (pagamentosExistentes === 0) {
      const pagamentos = [
        { referencia: "PAG_DINHEIRO_001", valor: 25000, formaPagamento: formatarNome("dinheiro") },
        { referencia: "PAG_CARTAO_001", valor: 25000, formaPagamento: formatarNome("cartão de crédito/débito") },
        { referencia: "PAG_TRANSFER_001", valor: 25000, formaPagamento: formatarNome("transferência bancária") },
        { referencia: "PAG_MULTICAIXA_001", valor: 25000, formaPagamento: formatarNome("multicaixa express") },
        { referencia: "PAG_DEPOSITO_001", valor: 25000, formaPagamento: formatarNome("depósito bancário") },
      ];

      for (const pag of pagamentos) {
        await prisma.pagamento.create({
          data: {
            ...pag,
            statusId: statusPendente.id,
            dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
      console.log("  ✅ Formas de pagamento inseridas");
    } else {
      console.log("  ⚠️ Formas de pagamento já existem");
    }
  }

  // ============================================
  // 6. PUBLICAÇÕES DE EXEMPLO
  // ============================================

  console.log("\n📰 Criando publicações de exemplo...");

  const publicacoesExistentes = await prisma.publicacao.count();
  
  if (publicacoesExistentes === 0) {
    const publicacoes = [
      {
        titulo: formatarNome("bem-vindos ao ano letivo 2026"),
        conteudo: "<p>Estamos felizes em anunciar o início do ano letivo de 2026. As aulas começam no dia 15 de fevereiro. Confiram o calendário acadêmico no site.</p>",
        resumo: formatarNome("início do ano letivo 2026 marcado para 15 de fevereiro"),
        autor: formatarNome("administrador"),
        categoria: "NOTICIA",
        destaque: true,
      },
      {
        titulo: formatarNome("workshop de informática"),
        conteudo: "<p>Inscrevam-se para o workshop de programação web que ocorrerá no dia 10 de março. Vagas limitadas!</p>",
        resumo: formatarNome("workshop gratuito de programação web"),
        autor: formatarNome("administrador"),
        categoria: "EVENTO",
        destaque: true,
      },
      {
        titulo: formatarNome("comunicado - prazo de matrícula"),
        conteudo: "<p>O prazo para matrícula foi prorrogado até o dia 28 de fevereiro. Aproveitem!</p>",
        resumo: formatarNome("prazo de matrícula prorrogado"),
        autor: formatarNome("administrador"),
        categoria: "COMUNICADO",
        destaque: false,
      },
    ];

    for (const pub of publicacoes) {
      await prisma.publicacao.create({
        data: pub,
      });
    }
    console.log("  ✅ Publicações de exemplo criadas");
  } else {
    console.log("  ⚠️ Publicações já existem");
  }

  // ============================================
  // 7. CONFIGURAÇÕES PADRÃO
  // ============================================

console.log("\n⚙️ Inserindo configurações padrão...");

const configsPadrao = [
  { chave: "nomeEscola", valor: formatarNome("Instituto Politécnico Privado O Pensador Do Futuro"), valorNum: null },
  { chave: "email", valor: "contato@ipp.ao", valorNum: null },
  { chave: "telefone", valor: "+244 999 999 999", valorNum: null },
  { chave: "endereco", valor: formatarNome("Camama, Luanda, Angola"), valorNum: null },
  { chave: "vagasPadrao", valor: null, valorNum: 50 },
  { chave: "idadeMinima", valor: null, valorNum: 15 },
  { chave: "idadeMaxima", valor: null, valorNum: 50 },
];

for (const config of configsPadrao) {
  await prisma.configuracao.upsert({
    where: { chave: config.chave },
    update: {
      valor: config.valor,
      valorNum: config.valorNum,
    },
    create: {
      chave: config.chave,
      valor: config.valor,
      valorNum: config.valorNum,
    },
  });
}
console.log("  ✅ Configurações padrão inseridas");   

  // ============================================
  // FINALIZAÇÃO
  // ============================================

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📊 Resumo final:");
  console.log(`  - ${await prisma.userNivel.count()} níveis de usuário`);
  console.log(`  - ${await prisma.genero.count()} gêneros`);
  console.log(`  - ${await prisma.statusInscricao.count()} status de inscrição`);
  console.log(`  - ${await prisma.statusMatricula.count()} status de matrícula`);
  console.log(`  - ${await prisma.statusPagamento.count()} status de pagamento`);
  console.log(`  - ${await prisma.turno.count()} turnos`);
  console.log(`  - ${await prisma.periodo.count()} períodos`);
  console.log(`  - ${await prisma.curso.count()} cursos`);
  console.log(`  - ${await prisma.classe.count()} classes`);
  console.log(`  - ${await prisma.turma.count()} turmas`);
  console.log(`  - ${await prisma.user.count()} usuários`);
  console.log(`  - ${await prisma.pagamento.count()} formas de pagamento`);
  console.log(`  - ${await prisma.publicacao.count()} publicações`);
  console.log(`  - ${await prisma.configuracao.count()} configurações`);

  console.log("\n🔐 Credenciais de acesso:");
  console.log("   Email: chipilica701@gmail.com");
  console.log("   Senha: 123456");
}

main()
  .catch((e) => {
    console.error("\n❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });