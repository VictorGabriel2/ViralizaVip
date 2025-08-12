const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const colors = require('colors');
require("dotenv").config()

module.exports = {
    name: 'setticket',
    description: "Comando destinado a configurar o canal de ticket.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "channel",
            value: "channel",
            type: ApplicationCommandOptionType.Channel,
            description: "Escolha o canal aonde ficara a mensagem.",
            required: true
        }
    ],


    run: async (client, interaction) => {
        const channel = interaction.options.getChannel("channel");

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
            )

        const embed = new EmbedBuilder()
            .setTitle("SUPORTE")
            .setDescription("_```Está com dúvidas ou problemas? utilize o menu de seleção abaixo para estar abrindo um atendimento particular com a nossa equipe!```_")
            .addFields(
                { name: "\u200b", value: " ", inline: false },
                { name: "**Ticket's atendidos ➠**", value: "`nenhum`", inline: false },
                { name: "**Horário de atendimento ➠** `08:00 ás 18:00 horas`", value: " ", inline: false }
            )
            .setImage("https://controlefinanceiro.granatum.com.br/wp-content/uploads/2022/08/header-atender.png")
            .setColor(0x313338)


        if (!interaction.member.roles.cache.has(`${process.env.STAFF}`)) {
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setDescription(`___**${interaction.user} você não possui permissão!**___`)
                    .setColor(0xFF0000)
                ],
                ephemeral: true
            })
            return;
        }
        const message = await interaction.reply({
            embeds: [new EmbedBuilder()
                .setDescription("✅ㆍComando executado com sucesso; Mensagem enviada em " + `${channel}`)
                .setColor(0x00FF00)
            ], ephemeral: true
        })

        if (!message) {
            return;
        } else {
            client.channels.cache.get(channel.id).send({ embeds: [embed], components: [menu] }).then((msg) => {
                msg.pin()
            })
        }
    }
}