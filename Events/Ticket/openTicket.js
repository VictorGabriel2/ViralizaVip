const client = require('../../index');
const colors = require('colors');
const { ChannelType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionsBitField, ActionRowBuilder, EmbedBuilder } = require('discord.js');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.values[0] === "financeiro" || interaction.values[0] === "suporte") {
        const setor = interaction.values[0];
        const horaV = new Date().getHours();
        const horaAtual = new Date().toLocaleTimeString();

        if (horaV < 8 || horaV >= 18) {
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setDescription("**Horário de atendimento ➠** `08:00 ás 18:00 horas`")
                    .setColor(0xFF0000)
                ],
                ephemeral: true
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("SUPORTE")
            .setDescription("_```" + `Olá ${interaction.user.username}, nossos ticket são respondidos dentro do prazo maxímo de uma hora, para adiantar o atendimento envie o seu problema ou dúvida para agilizar o atendimento.` + "```_")
            .addFields(
                { name: "\u200b", value: " ", inline: false },
                { name: "**Setor:**", value: "`" + `${setor}` + "`", inline: true },
                { name: "**Atendente:**", value: "`" + `Ninguem atendendo o ticket!` + "`", inline: true },
                { name: "**Horário de abertura:**", value: "`" + `${horaAtual}` + "`", inline: true },
            )
            .setColor(0x313338);

        const menuA = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('optionsticket')
                    .setPlaceholder('Funçoes do ticket!')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("❌ㆍEncerrar")
                            .setDescription("Encerre o atendimento.")
                            .setValue("encerrar_atendimento"),

                        new StringSelectMenuOptionBuilder()
                            .setLabel("📜ㆍGerar transcript")
                            .setDescription("Gere um transcript de todo o atendimento.")
                            .setValue("gerar_transcript"),

                        new StringSelectMenuOptionBuilder()
                            .setLabel("📞ㆍAssumir ticket")
                            .setDescription("Assuma o ticket para atende-lo.")
                            .setValue("assumir_ticket"),
                    )
            );

        const menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('options')
                    .setPlaceholder('Clique para abrir um ticket!')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("💰ㆍFinanceiro")
                            .setDescription("Setor de atendimento financeiro.")
                            .setValue("financeiro"),

                        new StringSelectMenuOptionBuilder()
                            .setLabel("☎️ㆍSuporte")
                            .setDescription("Setor de atendimento geral.")
                            .setValue("suporte"),
                    )
            );

        let cargo;
        if (setor === "financeiro") {
            cargo = "1357112387152384042";
        } else if (setor === "suporte") {
            cargo = "1357112387152384042";
        }

        async function openTicket(numero) {
            const nomeDoCanal = `📁ㆍticket-${numero}`;
            const topicoDoCanal = `ticket-${interaction.user.id}`;
            const existingChannel = interaction.guild.channels.cache.find(channel => channel.name === nomeDoCanal);

            if (!existingChannel) {
                const canalExiste = interaction.guild.channels.cache.find(channel => channel.name !== nomeDoCanal && channel.topic === topicoDoCanal);
                if (canalExiste) {
                    await interaction.deferUpdate().catch(() => { });
                    await interaction.followUp({
                        embeds: [new EmbedBuilder()
                            .setDescription("**Você possui um canal de atendimento em aberto! **" + `${canalExiste}`)
                            .setColor(0xFF0000)
                        ],
                        ephemeral: true
                    });
                } else {
                    await interaction.deferUpdate().catch(() => { });
                    const canal = await interaction.guild.channels.create({
                        name: nomeDoCanal,
                        type: ChannelType.GuildText,
                        topic: topicoDoCanal,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionsBitField.Flags.ViewChannel],
                                allow: [PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.SendMessages],
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionsBitField.Flags.ViewChannel],
                            },
                        ],
                    });

                    if (canal) {
                        await interaction.followUp({
                            embeds: [new EmbedBuilder()
                                .setDescription(`Canal ${setor} criado com sucesso em ${canal}.`)
                                .setColor(0x00FF00)],
                            ephemeral: true
                        });
                        await canal.send({ embeds: [embed], components: [menuA] }).then(async (msg) => {
                            msg.pin();
                            const msgE = await canal.send(`||${interaction.user}|| & ||${interaction.guild.roles.cache.get(cargo)}||`);
                            setTimeout(() => {
                                if (msgE) {
                                    msgE.delete();
                                } else {
                                    console.log(colors.red("❌ Menção não deletada!"));
                                    return;
                                }
                            }, 2000);
                        });
                    } else {
                        console.log(colors.red("❌ Canal não existe!"));
                        return;
                    }
                }
            } else {
                openTicket(numero + 1);
            }
        }

        openTicket(1);
    }
});
