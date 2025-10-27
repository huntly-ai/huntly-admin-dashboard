import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("🔍 Buscando membros sem usuários...")

  // Find all members without users
  const membersWithoutUsers = await prisma.teamMember.findMany({
    where: {
      user: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  })

  if (membersWithoutUsers.length === 0) {
    console.log("✅ Todos os membros já possuem usuários!")
    return
  }

  console.log(`📋 Encontrados ${membersWithoutUsers.length} membros sem usuários:`)
  membersWithoutUsers.forEach((member) => {
    console.log(`  - ${member.name} (${member.email}) - ${member.role}`)
  })

  console.log("\n🔐 Criando usuários...")

  // Default password for all users (should be changed on first login)
  const defaultPassword = "huntly123"
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  let successCount = 0
  let errorCount = 0

  for (const member of membersWithoutUsers) {
    try {
      await prisma.user.create({
        data: {
          email: member.email,
          password: hashedPassword,
          memberId: member.id,
        },
      })
      console.log(`  ✅ Usuário criado para ${member.name}`)
      successCount++
    } catch (error) {
      console.error(`  ❌ Erro ao criar usuário para ${member.name}:`, error)
      errorCount++
    }
  }

  console.log("\n📊 Resumo:")
  console.log(`  ✅ Criados com sucesso: ${successCount}`)
  console.log(`  ❌ Erros: ${errorCount}`)
  console.log(`\n🔑 Senha padrão para todos os usuários: ${defaultPassword}`)
  console.log("⚠️  IMPORTANTE: Peça aos usuários para alterarem a senha no primeiro acesso!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (error) => {
    console.error("❌ Erro:", error)
    await prisma.$disconnect()
    process.exit(1)
  })

